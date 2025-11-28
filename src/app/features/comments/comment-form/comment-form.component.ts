import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommentsService } from '../../../core/services/comments.service';
import { Comment, CreateCommentDto, UpdateCommentDto } from '../../../core/models/comment.interface';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="commentForm" (ngSubmit)="onSubmit()" class="space-y-4">
      <!-- Name field -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
          Nome <span class="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          formControlName="name"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          [class.border-red-500]="commentForm.get('name')?.invalid && commentForm.get('name')?.touched"
          placeholder="Digite seu nome"
        />
        <p 
          *ngIf="commentForm.get('name')?.invalid && commentForm.get('name')?.touched"
          class="mt-1 text-sm text-red-600"
          role="alert"
        >
          O nome é obrigatório
        </p>
      </div>

      <!-- Email field -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          E-mail <span class="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          formControlName="email"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          [class.border-red-500]="commentForm.get('email')?.invalid && commentForm.get('email')?.touched"
          placeholder="Digite seu e-mail"
        />
        <p 
          *ngIf="commentForm.get('email')?.hasError('required') && commentForm.get('email')?.touched"
          class="mt-1 text-sm text-red-600"
          role="alert"
        >
          O e-mail é obrigatório
        </p>
        <p 
          *ngIf="commentForm.get('email')?.hasError('email') && commentForm.get('email')?.touched"
          class="mt-1 text-sm text-red-600"
          role="alert"
        >
          Digite um e-mail válido
        </p>
      </div>

      <!-- Body field -->
      <div>
        <label for="comment-body" class="block text-sm font-medium text-gray-700 mb-1">
          Comentário <span class="text-red-500">*</span>
        </label>
        <textarea
          id="comment-body"
          formControlName="body"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          [class.border-red-500]="commentForm.get('body')?.invalid && commentForm.get('body')?.touched"
          placeholder="Digite seu comentário"
        ></textarea>
        <p 
          *ngIf="commentForm.get('body')?.invalid && commentForm.get('body')?.touched"
          class="mt-1 text-sm text-red-600"
          role="alert"
        >
          O comentário é obrigatório
        </p>
      </div>

      <!-- Error message -->
      <div 
        *ngIf="errorMessage()"
        class="p-3 bg-red-50 border border-red-200 rounded-md"
        role="alert"
      >
        <p class="text-sm text-red-800">{{ errorMessage() }}</p>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3">
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
          [disabled]="commentForm.invalid || isSubmitting()"
        >
          {{ isSubmitting() ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  `,
  styles: []
})
export class CommentFormComponent implements OnInit {
  @Input() postId!: number;
  @Input() comment: Comment | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  commentForm: FormGroup;
  isEditMode = false;
  isSubmitting = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private commentsService: CommentsService
  ) {
    this.commentForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
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
    this.isEditMode = !!this.comment;
    
    if (this.comment) {
      this.commentForm.patchValue({
        name: this.comment.name,
        email: this.comment.email,
        body: this.comment.body
      });
    } else {
      this.commentForm.reset();
    }
    
    this.errorMessage.set('');
  }

  onSubmit(): void {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const formValue = this.commentForm.value;

    if (this.isEditMode && this.comment) {
      // Update existing comment
      const dto: UpdateCommentDto = {
        name: formValue.name,
        email: formValue.email,
        body: formValue.body
      };

      this.commentsService.updateComment(this.comment.id, this.postId, dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.saved.emit();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(error.message || 'Erro ao atualizar comentário');
        }
      });
    } else {
      // Create new comment
      const dto: CreateCommentDto = {
        postId: this.postId,
        name: formValue.name,
        email: formValue.email,
        body: formValue.body
      };

      this.commentsService.createComment(dto).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.saved.emit();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(error.message || 'Erro ao criar comentário');
        }
      });
    }
  }

  onCancel(): void {
    this.commentForm.reset();
    this.errorMessage.set('');
    this.cancelled.emit();
  }
}

