import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentsService } from '../../../core/services/comments.service';
import { Comment } from '../../../core/models/comment.interface';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { CommentFormComponent } from '../comment-form/comment-form.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-comments-list',
  standalone: true,
  imports: [
    CommonModule,
    SpinnerComponent,
    ErrorMessageComponent,
    CommentFormComponent,
    ConfirmationDialogComponent
  ],
  template: `
    <div class="space-y-4">
      <!-- Add comment button -->
      <div class="flex justify-end">
        <button
          type="button"
          (click)="showAddForm.set(true)"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Adicionar comentário"
        >
          <span class="flex items-center gap-2">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Comentário
          </span>
        </button>
      </div>

      <!-- Add comment form -->
      <div *ngIf="showAddForm()" class="bg-white shadow-sm rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Novo Comentário</h3>
        <app-comment-form
          [postId]="postId"
          (saved)="onCommentAdded()"
          (cancelled)="showAddForm.set(false)"
        />
      </div>

      <!-- Error message -->
      <app-error-message
        [message]="errorMessage()"
        [showRetry]="true"
        (retry)="loadComments()"
        (dismissed)="errorMessage.set('')"
      />

      <!-- Loading state -->
      <div *ngIf="isLoading()" class="bg-white shadow-sm rounded-lg p-8">
        <app-spinner size="md" message="Carregando comentários..." />
      </div>

      <!-- Empty state -->
      <div 
        *ngIf="!isLoading() && comments().length === 0 && !errorMessage()"
        class="bg-white shadow-sm rounded-lg p-8 text-center"
      >
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhum comentário</h3>
        <p class="mt-1 text-sm text-gray-500">Seja o primeiro a comentar!</p>
      </div>

      <!-- Comments list -->
      <div *ngIf="!isLoading() && comments().length > 0" class="space-y-4">
        <article
          *ngFor="let comment of comments()"
          class="bg-white shadow-sm rounded-lg p-6"
        >
          <!-- Edit mode -->
          <div *ngIf="editingCommentId() === comment.id">
            <app-comment-form
              [postId]="postId"
              [comment]="comment"
              (saved)="onCommentUpdated()"
              (cancelled)="editingCommentId.set(null)"
            />
          </div>

          <!-- View mode -->
          <div *ngIf="editingCommentId() !== comment.id">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h4 class="text-sm font-semibold text-gray-900">
                  {{ comment.name }}
                </h4>
                <p class="text-xs text-gray-500">
                  {{ comment.email }}
                </p>
              </div>
              <div class="flex gap-2">
                <button
                  type="button"
                  (click)="startEdit(comment.id)"
                  class="text-sm text-indigo-600 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
                  aria-label="Editar comentário de {{comment.name}}"
                >
                  Editar
                </button>
                <button
                  type="button"
                  (click)="openDeleteConfirmation(comment)"
                  class="text-sm text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
                  aria-label="Excluir comentário de {{comment.name}}"
                >
                  Excluir
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-700 leading-relaxed">
              {{ comment.body }}
            </p>
          </div>
        </article>
      </div>

      <!-- Delete confirmation -->
      <app-confirmation-dialog
        [isOpen]="isDeleteDialogOpen()"
        title="Excluir Comentário"
        message="Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        (confirmed)="onDeleteConfirmed()"
        (cancelled)="onDeleteCancelled()"
      />
    </div>
  `,
  styles: []
})
export class CommentsListComponent implements OnInit {
  @Input() postId!: number;

  comments = signal<Comment[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  showAddForm = signal(false);
  editingCommentId = signal<number | null>(null);
  isDeleteDialogOpen = signal(false);
  commentToDelete = signal<Comment | null>(null);

  constructor(private commentsService: CommentsService) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    if (!this.postId) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.commentsService.getCommentsForPost(this.postId).subscribe({
      next: (comments) => {
        this.comments.set(comments);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Erro ao carregar comentários');
        this.isLoading.set(false);
      }
    });
  }

  onCommentAdded(): void {
    this.showAddForm.set(false);
    this.loadComments();
  }

  startEdit(commentId: number): void {
    this.editingCommentId.set(commentId);
  }

  onCommentUpdated(): void {
    this.editingCommentId.set(null);
    this.loadComments();
  }

  openDeleteConfirmation(comment: Comment): void {
    this.commentToDelete.set(comment);
    this.isDeleteDialogOpen.set(true);
  }

  onDeleteConfirmed(): void {
    const comment = this.commentToDelete();
    if (!comment) return;

    this.commentsService.deleteComment(comment.id, this.postId).subscribe({
      next: () => {
        this.loadComments();
        this.isDeleteDialogOpen.set(false);
        this.commentToDelete.set(null);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Erro ao excluir comentário');
        this.isDeleteDialogOpen.set(false);
        this.commentToDelete.set(null);
      }
    });
  }

  onDeleteCancelled(): void {
    this.isDeleteDialogOpen.set(false);
    this.commentToDelete.set(null);
  }
}

