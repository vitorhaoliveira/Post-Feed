import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostsTableComponent } from '../posts-table/posts-table.component';
import { PostFormModalComponent } from '../post-form-modal/post-form-modal.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { PostsService } from '../../../core/services/posts.service';
import { Post, CreatePostDto, UpdatePostDto } from '../../../core/models/post.interface';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PostsTableComponent,
    PostFormModalComponent,
    ConfirmationDialogComponent,
    ErrorMessageComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Post Feed</h1>
            <button
              type="button"
              class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              (click)="openCreateModal()"
              aria-label="Criar novo post"
            >
              <span class="flex items-center justify-center gap-2">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span class="hidden xs:inline">Novo Post</span>
                <span class="xs:hidden">Novo</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <app-error-message
          [message]="errorMessage()"
          [showRetry]="true"
          (retry)="onRetry()"
          (dismissed)="onDismissError()"
        />

        <app-posts-table
          (edit)="openEditModal($event)"
          (delete)="openDeleteConfirmation($event)"
        />
      </main>

      <!-- Create/Edit Modal -->
      <app-post-form-modal
        [isOpen]="isFormModalOpen()"
        [post]="selectedPost()"
        (saved)="onPostSaved()"
        (cancelled)="onFormCancelled()"
      />

      <!-- Delete Confirmation -->
      <app-confirmation-dialog
        [isOpen]="isDeleteDialogOpen()"
        title="Excluir Post"
        message="Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        (confirmed)="onDeleteConfirmed()"
        (cancelled)="onDeleteCancelled()"
      />
    </div>
  `,
  styles: []
})
export class PostsListComponent implements OnInit {
  isFormModalOpen = signal(false);
  isDeleteDialogOpen = signal(false);
  selectedPost = signal<Post | null>(null);
  postToDelete = signal<Post | null>(null);
  errorMessage = signal<string>('');

  constructor(public postsService: PostsService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.postsService.loadPosts().subscribe({
      error: (error) => {
        this.errorMessage.set(error.message || 'Erro ao carregar posts');
      }
    });
  }

  openCreateModal(): void {
    this.selectedPost.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(post: Post): void {
    this.selectedPost.set(post);
    this.isFormModalOpen.set(true);
  }

  openDeleteConfirmation(post: Post): void {
    this.postToDelete.set(post);
    this.isDeleteDialogOpen.set(true);
  }

  onPostSaved(): void {
    this.isFormModalOpen.set(false);
    this.selectedPost.set(null);
  }

  onFormCancelled(): void {
    this.isFormModalOpen.set(false);
    this.selectedPost.set(null);
  }

  onDeleteConfirmed(): void {
    const post = this.postToDelete();
    if (post) {
      this.postsService.deletePost(post.id).subscribe({
        error: (error) => {
          this.errorMessage.set(error.message || 'Erro ao excluir post');
        }
      });
    }
    this.isDeleteDialogOpen.set(false);
    this.postToDelete.set(null);
  }

  onDeleteCancelled(): void {
    this.isDeleteDialogOpen.set(false);
    this.postToDelete.set(null);
  }

  onRetry(): void {
    this.errorMessage.set('');
    this.loadPosts();
  }

  onDismissError(): void {
    this.errorMessage.set('');
    this.postsService.clearError();
  }
}

