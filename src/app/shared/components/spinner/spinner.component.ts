import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="flex items-center justify-center"
      [class.h-screen]="fullScreen"
      role="status"
      aria-live="polite"
      aria-label="Carregando"
    >
      <div class="flex flex-col items-center gap-3">
        <div 
          class="animate-spin rounded-full border-t-2 border-b-2"
          [class]="sizeClass"
          [style.borderColor]="color"
        ></div>
        <p *ngIf="message" class="text-sm text-gray-600">{{ message }}</p>
      </div>
    </div>
  `,
  styles: []
})
export class SpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() color = '#3B82F6';
  @Input() message = '';
  @Input() fullScreen = false;

  get sizeClass(): string {
    const sizes = {
      sm: 'h-8 w-8',
      md: 'h-12 w-12',
      lg: 'h-16 w-16'
    };
    return sizes[this.size];
  }
}

