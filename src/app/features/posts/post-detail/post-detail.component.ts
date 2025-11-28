import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PostsService } from '../../../core/services/posts.service';
import { Post } from '../../../core/models/post.interface';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { PostFormModalComponent } from '../post-form-modal/post-form-modal.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { CommentsListComponent } from '../../comments/comments-list/comments-list.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SpinnerComponent,
    ErrorMessageComponent,
    CommentsListComponent,
    PostFormModalComponent,
    ConfirmationDialogComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            type="button"
            routerLink="/posts"
            class="flex items-center gap-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1 mb-4"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para Posts
          </button>
          <h1 class="text-3xl font-bold text-gray-900">Detalhes do Post</h1>
        </div>
      </header>

      <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Loading state -->
        <app-spinner 
          *ngIf="isLoading()"
          size="lg"
          message="Carregando post..."
        />

        <!-- Error state -->
        <app-error-message
          [message]="errorMessage()"
          [showRetry]="true"
          (retry)="loadPost()"
          (dismissed)="errorMessage.set('')"
        />

        <!-- Post content -->
        <div *ngIf="!isLoading() && post()" class="space-y-6">
          <!-- Post card -->
          <article class="bg-white shadow-sm rounded-lg overflow-hidden">
            <div class="p-4 sm:p-6">
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                <div class="flex-1">
                  <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {{ post()?.title }}
                  </h2>
                  <p class="text-xs sm:text-sm text-gray-500">
                    Post ID: {{ post()?.id }} | User ID: {{ post()?.userId }}
                  </p>
                </div>
                <div class="flex gap-2 sm:flex-shrink-0">
                  <button
                    type="button"
                    (click)="openEditModal()"
                    class="flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Editar post"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    (click)="openDeleteConfirmation()"
                    class="flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label="Excluir post"
                  >
                    Excluir
                  </button>
                </div>
              </div>
              <div class="prose max-w-none">
                <p class="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {{ post()?.body }}
                </p>
              </div>
            </div>
          </article>

          <!-- Comments section -->
          <section aria-labelledby="comments-heading">
            <h2 id="comments-heading" class="text-xl font-bold text-gray-900 mb-4">
              Comentários
            </h2>
            <app-comments-list [postId]="postId()" />
          </section>
        </div>
      </main>

      <!-- Edit Modal -->
      <app-post-form-modal
        [isOpen]="isEditModalOpen()"
        [post]="post()"
        (saved)="onPostUpdated()"
        (cancelled)="isEditModalOpen.set(false)"
      />

      <!-- Delete Confirmation -->
      <app-confirmation-dialog
        [isOpen]="isDeleteDialogOpen()"
        title="Excluir Post"
        message="Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita e todos os comentários serão perdidos."
        confirmText="Excluir"
        cancelText="Cancelar"
        (confirmed)="onDeleteConfirmed()"
        (cancelled)="isDeleteDialogOpen.set(false)"
      />
    </div>
  `,
  styles: []
})
export class PostDetailComponent implements OnInit {
  postId = signal<number>(0);
  post = signal<Post | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');
  isEditModalOpen = signal(false);
  isDeleteDialogOpen = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postsService: PostsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.postId.set(id);
      this.loadPost();
    });
  }

  loadPost(): void {
    const id = this.postId();
    if (!id) return;

    // Try to get from cache first
    const cached = this.postsService.getPostFromCache(id);
    if (cached) {
      this.post.set(cached);
      return;
    }

    // Otherwise fetch from API
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.postsService.getPost(id).subscribe({
      next: (post) => {
        this.post.set(post);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Erro ao carregar post');
        this.isLoading.set(false);
      }
    });
  }

  openEditModal(): void {
    this.isEditModalOpen.set(true);
  }

  openDeleteConfirmation(): void {
    this.isDeleteDialogOpen.set(true);
  }

  onPostUpdated(): void {
    this.isEditModalOpen.set(false);
    this.loadPost();
  }

  onDeleteConfirmed(): void {
    const id = this.postId();
    if (!id) return;

    this.postsService.deletePost(id).subscribe({
      next: () => {
        this.router.navigate(['/posts']);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Erro ao excluir post');
        this.isDeleteDialogOpen.set(false);
      }
    });
  }
}

