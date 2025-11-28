import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Post, CreatePostDto, UpdatePostDto } from '../../../core/models/post.interface';
import { PostsService } from '../../../core/services/posts.service';

@Component({
  selector: 'app-post-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal
      [isOpen]="isOpen"
      [title]="isEditMode ? 'Editar Post' : 'Criar Novo Post'"
      size="lg"
      [closeOnBackdrop]="false"
      (closed)="onCancel()"
    >
      <form [formGroup]="postForm" (ngSubmit)="onSubmit()">
        <!-- Title field -->
        <div class="mb-4">
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
            Título <span class="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            formControlName="title"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            [class.border-red-500]="postForm.get('title')?.invalid && postForm.get('title')?.touched"
            placeholder="Digite o título do post"
          />
          <p 
            *ngIf="postForm.get('title')?.invalid && postForm.get('title')?.touched"
            class="mt-1 text-sm text-red-600"
            role="alert"
          >
            O título é obrigatório
          </p>
        </div>

        <!-- Body field -->
        <div class="mb-4">
          <label for="body" class="block text-sm font-medium text-gray-700 mb-1">
            Conteúdo <span class="text-red-500">*</span>
          </label>
          <textarea
            id="body"
            formControlName="body"
            rows="6"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            [class.border-red-500]="postForm.get('body')?.invalid && postForm.get('body')?.touched"
            placeholder="Digite o conteúdo do post"
          ></textarea>
          <p 
            *ngIf="postForm.get('body')?.invalid && postForm.get('body')?.touched"
            class="mt-1 text-sm text-red-600"
            role="alert"
          >
            O conteúdo é obrigatório
          </p>
        </div>

        <!-- Error message -->
        <div 
          *ngIf="errorMessage()"
          class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
          role="alert"
        >
          <p class="text-sm text-red-800">{{ errorMessage() }}</p>
        </div>

        <!-- Buttons -->
        <div footer class="w-full flex gap-3">
          <button
            type="button"
            class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            (click)="onCancel()"
            [disabled]="isSubmitting()"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            [disabled]="postForm.invalid || isSubmitting()"
          >
            {{ isSubmitting() ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </app-modal>
  `,
  styles: []
})
export class PostFormModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() post: Post | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  postForm: FormGroup;
  isEditMode = false;
  isSubmitting = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private postsService: PostsService
  ) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      body: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(): void {
    this.initForm();
  }

  private initForm(): void {
    this.isEditMode = !!this.post;
    
    if (this.post) {
      this.postForm.patchValue({
        title: this.post.title,
        body: this.post.body
      });
    } else {
      this.postForm.reset();
    }
    
    this.errorMessage.set('');
  }

  onSubmit(): void {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const formValue = this.postForm.value;

    if (this.isEditMode && this.post) {
      // Update existing post
      const dto: UpdatePostDto = {
        title: formValue.title,
        body: formValue.body
      };

      this.postsService.updatePost(this.post.id, dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.saved.emit();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(error.message || 'Erro ao atualizar post');
        }
      });
    } else {
      // Create new post
      const dto: CreatePostDto = {
        userId: 1, // Default user ID
        title: formValue.title,
        body: formValue.body
      };

      this.postsService.createPost(dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.saved.emit();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(error.message || 'Erro ao criar post');
        }
      });
    }
  }

  onCancel(): void {
    this.postForm.reset();
    this.errorMessage.set('');
    this.cancelled.emit();
  }
}

