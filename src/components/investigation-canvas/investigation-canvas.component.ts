
import { Component, ChangeDetectionStrategy, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolService } from '../../services/tool.service';
import { ToolStateService } from '../../services/tool-state.service';
import { Tool } from '../../models/tool.model';
import { UserService } from '../../services/user.service';
import { GeminiService } from '../../services/gemini.service';
import { Type } from '@google/genai';

interface CanvasNode {
  id: string;
  tool: Tool;
  x: number;
  y: number;
}

interface Connection {
  from: string; // from node id
  to: string; // to node id
}

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-investigation-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './investigation-canvas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvestigationCanvasComponent {
  private toolService = inject(ToolService);
  private toolStateService = inject(ToolStateService);
  private userService = inject(UserService);
  private geminiService = inject(GeminiService);

  user = this.userService.currentUser;
  
  // Track hovered tool for descriptions
  hoveredTool = signal<Tool | null>(null);
  
  allTools = computed(() => {
    const userRole = this.user()?.role;
    if (!userRole) return [];

    const excludedToolIdsForCanvas = [
      'ai-assistant', 'mattermost', 'nextcloud', 'webtop', 'meedan-check',
      'ushahidi', 'n8n', 'superdesk', 'ghost-ye', 'erpnext', 'openproject',
      'moodle', 'bigbluebutton', 'tooljet', 'chatwoot', 'nocodb', 'civicrm'
    ];

    return this.toolService.tools().filter(tool => {
      if (excludedToolIdsForCanvas.includes(tool.id)) {
        return false;
      }
      if (userRole === 'super-admin') {
        return tool.isActive;
      }
      return tool.isActive && tool.allowedRoles.includes(userRole);
    });
  });

  categorizedTools = computed(() => {
    return this.allTools().reduce((acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push(tool);
      return acc;
    }, {} as Record<string, Tool[]>);
  });

  get categories(): string[] {
    return Object.keys(this.categorizedTools()).sort((a, b) => a.localeCompare(b));
  }

  nodes = signal<CanvasNode[]>([]);
  connections = signal<Connection[]>([]);
  
  private draggedTool = signal<Tool | null>(null);
  private draggedNodeId = signal<string | null>(null);
  private dragOffset = signal<Point>({ x: 0, y: 0 });

  isDrawingConnection = signal(false);
  private connectionStartNodeId = signal<string | null>(null);
  connectionLinePath = signal<string | null>(null);
  
  // --- AI Workflow Builder State ---
  aiCommand = signal('');
  isAiBuilding = signal(false);
  aiError = signal('');

  connectionPaths = computed(() => {
    return this.connections().map(conn => {
      const fromNode = this.nodes().find(n => n.id === conn.from);
      const toNode = this.nodes().find(n => n.id === conn.to);
      if (!fromNode || !toNode) return '';
      
      const startX = fromNode.x + 240; // width of node
      const startY = fromNode.y + 36; // middle of node height
      const endX = toNode.x;
      const endY = toNode.y + 36;
      
      return this.generateSvgPath(startX, startY, endX, endY);
    });
  });
  
  private generateSvgPath(startX: number, startY: number, endX: number, endY: number): string {
    const dx = endX - startX;
    const c1x = startX + Math.abs(dx) * 0.5;
    const c1y = startY;
    const c2x = endX - Math.abs(dx) * 0.5;
    const c2y = endY;
    return `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
  }

  onToolDragStart(event: DragEvent, tool: Tool) {
    this.draggedTool.set(tool);
    if(event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  onCanvasDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onCanvasDrop(event: DragEvent) {
    event.preventDefault();
    const tool = this.draggedTool();
    if (tool) {
      const canvasRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const x = event.clientX - canvasRect.left - 120; // Adjust for half node width
      const y = event.clientY - canvasRect.top - 36;  // Adjust for half node height
      
      const newNode: CanvasNode = { id: `${tool.id}-${Date.now()}`, tool, x, y };
      this.nodes.update(nodes => [...nodes, newNode]);
      this.draggedTool.set(null);
    }
  }

  onNodeDragStart(event: MouseEvent, nodeId: string) {
    const target = event.target as HTMLElement;
    // Prevent starting a drag when clicking on buttons or connection points
    if (target.closest('button') || target.classList.contains('connection-point')) {
      return;
    }
    const node = this.nodes().find(n => n.id === nodeId);
    if (node) {
      this.draggedNodeId.set(nodeId);
      this.dragOffset.set({ x: event.clientX - node.x, y: event.clientY - node.y });
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent) {
    const draggedNodeId = this.draggedNodeId();
    if (draggedNodeId) {
      const offset = this.dragOffset();
      const newX = event.clientX - offset.x;
      const newY = event.clientY - offset.y;
      this.nodes.update(nodes =>
        nodes.map(n => n.id === draggedNodeId ? { ...n, x: newX, y: newY } : n)
      );
    }

    if (this.isDrawingConnection()) {
      const startNode = this.nodes().find(n => n.id === this.connectionStartNodeId());
      if (startNode) {
          const canvasRect = (document.querySelector('.investigation-canvas') as HTMLElement)?.getBoundingClientRect();
          if (!canvasRect) return;
          const mouseX = event.clientX - canvasRect.left;
          const mouseY = event.clientY - canvasRect.top;
          const startX = startNode.x + 240;
          const startY = startNode.y + 36;
          this.connectionLinePath.set(this.generateSvgPath(startX, startY, mouseX, mouseY));
      }
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onDocumentMouseUp(event: MouseEvent) {
    this.draggedNodeId.set(null);
    if (this.isDrawingConnection()) {
        this.cancelConnection();
    }
  }

  startConnection(event: MouseEvent, nodeId: string) {
    event.stopPropagation();
    this.isDrawingConnection.set(true);
    this.connectionStartNodeId.set(nodeId);
  }
  
  endConnection(event: MouseEvent, endNodeId: string) {
    event.stopPropagation();
    const startNodeId = this.connectionStartNodeId();
    if (this.isDrawingConnection() && startNodeId && startNodeId !== endNodeId) {
      const alreadyExists = this.connections().some(c => c.from === startNodeId && c.to === endNodeId);
      if (!alreadyExists) {
        this.connections.update(conns => [...conns, { from: startNodeId, to: endNodeId }]);
      }
    }
    this.cancelConnection();
  }

  cancelConnection() {
    this.isDrawingConnection.set(false);
    this.connectionStartNodeId.set(null);
    this.connectionLinePath.set(null);
  }

  runNodeTool(event: MouseEvent, tool: Tool) {
    event.stopPropagation();
    this.toolStateService.runTool(tool.id);
  }

  removeNode(event: MouseEvent, nodeId: string) {
    event.stopPropagation();
    this.nodes.update(nodes => nodes.filter(n => n.id !== nodeId));
    this.connections.update(conns => conns.filter(c => c.from !== nodeId && c.to !== nodeId));
  }
  
  async buildWorkflowWithAi() {
    if (!this.aiCommand()) return;
    this.isAiBuilding.set(true);
    this.aiError.set('');
    this.nodes.set([]);
    this.connections.set([]);

    const toolList = this.allTools().map(t => `- ${t.name} (id: ${t.id}): ${t.description}`).join('\n');
    const systemInstruction = `أنت باني سير عمل ذكي لمنصة تحقيقات صحفية. مهمتك هي تحليل طلب المستخدم وإرجاع سلسلة من معرفات الأدوات (tool IDs) التي يجب استخدامها لإنجاز المهمة. يجب عليك فقط استخدام الأدوات المتوفرة في القائمة أدناه. أرجع معرفات الأدوات بالترتيب الدقيق الذي يجب تنفيذها به.

الأدوات المتاحة:
${toolList}

سيقدم المستخدم أمراً باللغة العربية. يجب أن ترد بكائن JSON يحتوي على مفتاح واحد "toolIds" وهو عبارة عن مصفوفة من السلاسل النصية. لا تقم بإضافة أي نص أو شرح آخر.

مثال:
طلب المستخدم: "ابحث عن حسابات المستخدم 'testuser' على وسائل التواصل الاجتماعي ثم أرشف النتائج"
ردك بصيغة JSON:
{
  "toolIds": ["sherlock-maigret", "archivebox"]
}
`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            toolIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        },
        required: ['toolIds']
    };

    try {
      const result = await this.geminiService.generateStructuredResponse(this.aiCommand(), schema, systemInstruction);
      if (result && result.toolIds && Array.isArray(result.toolIds)) {
        this.createNodesFromAi(result.toolIds);
      } else {
        throw new Error("Invalid response format from AI.");
      }
    } catch (error) {
      console.error(error);
      this.aiError.set('فشل الذكاء الاصطناعي في بناء سير العمل. يرجى المحاولة مرة أخرى أو توضيح طلبك.');
    } finally {
      this.isAiBuilding.set(false);
    }
  }

  private createNodesFromAi(toolIds: string[]) {
    const newNodes: CanvasNode[] = [];
    const newConnections: Connection[] = [];
    const toolsToCreate = toolIds
      .map(id => this.allTools().find(t => t.id === id))
      .filter((t): t is Tool => !!t);

    const nodeWidth = 240;
    const nodeHeight = 72;
    const horizontalSpacing = 80;
    const verticalSpacing = 60;
    const nodesPerRow = 3;

    toolsToCreate.forEach((tool, index) => {
      const newNode: CanvasNode = {
        id: `${tool.id}-${Date.now()}-${index}`,
        tool,
        x: (index % nodesPerRow) * (nodeWidth + horizontalSpacing) + 50,
        y: Math.floor(index / nodesPerRow) * (nodeHeight + verticalSpacing) + 50
      };
      newNodes.push(newNode);

      if (index > 0) {
        newConnections.push({ from: newNodes[index - 1].id, to: newNode.id });
      }
    });

    this.nodes.set(newNodes);
    this.connections.set(newConnections);
  }
}
