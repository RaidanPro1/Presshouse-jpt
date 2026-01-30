
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggerService } from '../../services/logger.service';
import { UserService } from '../../services/user.service';
import { SystemService, ServiceAction } from '../../services/system.service';

interface Stat {
  name: string;
  value: number;
  unit: string;
  color: string;
}

interface Service {
  name: string;
  id: string; // The container name
  status: 'Online' | 'Degraded' | 'Offline' | 'Restarting';
}

@Component({
  selector: 'app-system-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-stats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemStatsComponent {
  private logger = inject(LoggerService);
  private userService = inject(UserService);
  private systemService = inject(SystemService);

  cpuStat = signal<Stat>({ name: 'المعالج', value: 25, unit: '%', color: 'bg-green-500' });
  ramStat = signal<Stat>({ name: 'الذاكرة', value: 60, unit: '%', color: 'bg-yellow-500' });
  diskStat = signal<Stat>({ name: 'التخزين', value: 85, unit: '%', color: 'bg-red-500' });
  networkStat = signal<Stat>({ name: 'الشبكة (تنزيل)', value: 12.5, unit: 'MB/s', color: 'bg-sky-500' });
  
  services = signal<Service[]>([
    { name: 'Gateway (Proxy)', id: 'ph-internal-proxy', status: 'Online' },
    { name: 'AI Core (Ollama)', id: 'ph-ollama-engine', status: 'Online' },
    { name: 'Database (Postgres)', id: 'ph-postgres', status: 'Online' },
    { name: 'WhatsApp (Evolution)', id: 'ph-evolution-api', status: 'Online' },
    { name: 'Radio (AzuraCast)', id: 'ph-azuracast', status: 'Online' },
    { name: 'Publishing (Ghost)', id: 'ph-ghost', status: 'Online' },
    { name: 'Mail Server (Poste.io)', id: 'ph-posteio', status: 'Degraded' },
    { name: 'Archive Service', id: 'ph-archivebox', status: 'Offline' },
    { name: 'Passwords (Vaultwarden)', id: 'ph-vaultwarden', status: 'Online' },
  ]);

  isChecking = signal(false);

  performAction(serviceId: string, action: ServiceAction) {
    const service = this.services().find(s => s.id === serviceId);
    if (!service) return;

    this.services.update(services => 
        services.map(s => s.id === serviceId ? { ...s, status: 'Restarting' } : s)
    );
    
    this.systemService.performServiceAction(serviceId, action).subscribe({
      next: () => {
        // In a real app, you'd have a websocket or polling to get the actual status.
        // For now, we simulate a return to 'Online'.
        setTimeout(() => {
          this.services.update(services =>
            services.map(s => s.id === serviceId ? { ...s, status: 'Online' } : s)
          );
        }, 2000);

        this.logger.logEvent(
          `Service Action: ${action}`,
          `Action '${action}' performed on service: ${service.name} (${service.id})`,
          this.userService.currentUser()?.name,
          true
        );
      },
      error: (err) => {
        console.error(`Failed to perform action on ${serviceId}`, err);
        this.services.update(services =>
          services.map(s => s.id === serviceId ? { ...s, status: 'Offline' } : s)
        );
      }
    });
  }

  runHealthCheck() {
    this.isChecking.set(true);
    console.log('[SIMULATION] Running health check...');
    setTimeout(() => {
      const offlineService = this.services().find(s => s.status === 'Offline');
      if (offlineService) {
        this.logger.logEvent(
          'فشل فحص صحة النظام',
          `تم اكتشاف أن خدمة "${offlineService.name}" في حالة Offline.`,
          'System Monitor',
          true // This is a root-level event
        );
      }
      this.isChecking.set(false);
    }, 2000);
  }
}
