
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documentation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentationComponent {
  // This would typically come from a service or a CMS
  readonly colabNotebookUrl = 'https://colab.research.google.com/drive/1_some_notebook_id';
}
