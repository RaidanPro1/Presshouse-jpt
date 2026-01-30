
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EarlyWarningComponent } from '../early-warning/early-warning.component';

@Component({
  selector: 'app-indilab',
  standalone: true,
  imports: [CommonModule, EarlyWarningComponent],
  templateUrl: './indilab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndilabComponent {
  
}