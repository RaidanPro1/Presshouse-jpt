
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForensicsService } from '../../services/forensics.service';

interface EvidenceFile {
  id: number;
  name: string;
  type: 'video' | 'image' | 'audio';
  hash: string;
  status: 'Uploaded' | 'Analyzing' | 'Complete' | 'Error';
  thumbnail: string;
}

type AnalysisTab = 'metadata' | 'keyframes' | 'deepfake' | 'geolocation';

@Component({
  selector: 'app-forensic-lab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forensic-lab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForensicLabComponent {
  private forensicsService = inject(ForensicsService);
  
  evidenceFiles = signal<EvidenceFile[]>([]);
  selectedFile = signal<EvidenceFile | null>(null);
  activeAnalysisTab = signal<AnalysisTab>('metadata');
  
  isAnalyzing = signal(false);
  analysisError = signal('');
  analysisReport = signal<any | null>(null);

  selectFile(file: EvidenceFile) {
    this.selectedFile.set(file);
    this.activeAnalysisTab.set('metadata');
    this.analysisReport.set(null); // Clear old report
  }
  
  setTab(tab: AnalysisTab) {
    this.activeAnalysisTab.set(tab);
  }

  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isAnalyzing.set(true);
    this.analysisError.set('');
    this.analysisReport.set(null);
    this.selectedFile.set(null);

    this.forensicsService.analyzeMedia(file).subscribe({
      next: (report) => {
        this.analysisReport.set(report);
        const newEvidenceFile: EvidenceFile = {
          id: Date.now(),
          name: file.name,
          type: file.type.startsWith('video') ? 'video' : 'audio',
          hash: report.metadata?.SHA256 || report.metadata?.MD5 || 'N/A',
          status: 'Complete',
          thumbnail: 'assets/images/violations/report.jpg', // Static placeholder for now
        };
        this.evidenceFiles.update(files => [newEvidenceFile, ...files]);
        this.selectFile(newEvidenceFile);
        this.isAnalyzing.set(false);
      },
      error: (err) => {
        console.error(err);
        this.analysisError.set('فشل تحليل الملف. قد يكون الملف غير مدعوم أو حدث خطأ في الخادم.');
        this.isAnalyzing.set(false);
      }
    });
  }

  get formattedMetadata(): { key: string, value: string }[] {
    const metadata = this.analysisReport()?.metadata;
    if (!metadata || typeof metadata !== 'object') return [];

    const EXCLUDED_KEYS = ['SourceFile', 'ExifToolVersion', 'FileName', 'Directory', 'FilePermissions', 'FileModifyDate', 'FileAccessDate', 'FileInodeChangeDate', 'Error', 'Warning'];
    
    return Object.entries(metadata)
      .filter(([key]) => !EXCLUDED_KEYS.includes(key))
      .map(([key, value]) => ({ key, value: String(value) }));
  }
}
