import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="message"
      class="rounded-lg p-4 mb-4"
      [class]="typeClass"
      role="alert"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg 
            *ngIf="type === 'error'"
            class="h-5 w-5 text-red-400" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <svg 
            *ngIf="type === 'warning'"
            class="h-5 w-5 text-yellow-400" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <svg 
            *ngIf="type === 'info'"
            class="h-5 w-5 text-blue-400" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium" [class]="textClass">
            {{ message }}
          </p>
        </div>
        <div class="ml-auto pl-3 flex gap-2">
          <button
            *ngIf="showRetry"
            type="button"
            class="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
            [class]="buttonClass"
            (click)="onRetry()"
            aria-label="Tentar novamente"
          >
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            class="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
            [class]="buttonClass"
            (click)="onDismiss()"
            aria-label="Fechar mensagem"
          >
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ErrorMessageComponent {
  @Input() message = '';
  @Input() type: 'error' | 'warning' | 'info' = 'error';
  @Input() showRetry = false;
  @Output() retry = new EventEmitter<void>();
  @Output() dismissed = new EventEmitter<void>();

  get typeClass(): string {
    const classes = {
      error: 'bg-red-50 border border-red-200',
      warning: 'bg-yellow-50 border border-yellow-200',
      info: 'bg-blue-50 border border-blue-200'
    };
    return classes[this.type];
  }

  get textClass(): string {
    const classes = {
      error: 'text-red-800',
      warning: 'text-yellow-800',
      info: 'text-blue-800'
    };
    return classes[this.type];
  }

  get buttonClass(): string {
    const classes = {
      error: 'text-red-500 hover:bg-red-100 focus:ring-red-600',
      warning: 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600',
      info: 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600'
    };
    return classes[this.type];
  }

  onRetry(): void {
    this.retry.emit();
  }

  onDismiss(): void {
    this.dismissed.emit();
  }
}

