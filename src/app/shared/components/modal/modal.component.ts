import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        (click)="onBackdropClick()"
        aria-hidden="true"
      ></div>

      <!-- Modal panel -->
      <div class="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
        <div 
          class="relative transform overflow-hidden rounded-t-lg sm:rounded-lg bg-white shadow-xl transition-all w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col"
          [class]="sizeClass"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div *ngIf="title" class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0">
            <div class="flex items-center justify-between">
              <h3 
                id="modal-title" 
                class="text-base sm:text-lg font-semibold text-gray-900"
              >
                {{ title }}
              </h3>
              <button
                type="button"
                class="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
                (click)="close()"
                aria-label="Fechar modal"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto flex-1">
            <ng-content></ng-content>
          </div>

          <!-- Footer -->
          <div *ngIf="showFooter" class="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
            <ng-content select="[footer]"></ng-content>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() showFooter = true;
  @Input() closeOnBackdrop = true;
  @Input() closeOnEscape = true;
  @Output() closed = new EventEmitter<void>();

  get sizeClass(): string {
    const sizes = {
      sm: 'sm:max-w-sm',
      md: 'sm:max-w-md',
      lg: 'sm:max-w-lg',
      xl: 'sm:max-w-xl'
    };
    return sizes[this.size];
  }

  ngOnInit(): void {
    if (this.isOpen) {
      this.trapFocus();
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.isOpen && this.closeOnEscape) {
      this.close();
    }
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop) {
      this.close();
    }
  }

  close(): void {
    this.isOpen = false;
    document.body.style.overflow = '';
    this.closed.emit();
  }

  private trapFocus(): void {
    document.body.style.overflow = 'hidden';
  }
}

