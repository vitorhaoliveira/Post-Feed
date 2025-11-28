import { Component, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PostsService } from '../../../core/services/posts.service';
import { Post } from '../../../core/models/post.interface';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-posts-table',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SpinnerComponent],
  template: `
    <div class="bg-white shadow-sm rounded-lg overflow-hidden">
      <!-- Search and controls -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <label for="search" class="sr-only">Buscar posts</label>
            <input
              id="search"
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar por ID, título ou conteúdo..."
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Campo de busca"
            />
          </div>
          <div class="flex gap-2">
            <select
              [(ngModel)]="sortBy"
              (ngModelChange)="onSortChange()"
              class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Ordenar por"
            >
              <option value="id">ID</option>
              <option value="title">Título</option>
            </select>
            <select
              [(ngModel)]="sortOrder"
              (ngModelChange)="onSortChange()"
              class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Ordem"
            >
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div *ngIf="postsService.loading()" class="p-8">
        <app-spinner size="lg" message="Carregando posts..." />
      </div>

      <!-- Empty state -->
      <div 
        *ngIf="!postsService.loading() && filteredPosts().length === 0"
        class="p-8 text-center"
      >
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhum post encontrado</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ searchTerm ? 'Tente buscar com outros termos.' : 'Comece criando um novo post.' }}
        </p>
      </div>

      <!-- Desktop Table (hidden on mobile) -->
      <div *ngIf="!postsService.loading() && paginatedPosts().length > 0" class="hidden md:block overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conteúdo
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let post of paginatedPosts()" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ post.id }}
              </td>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                {{ post.title }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ post.body | slice:0:100 }}{{ post.body.length > 100 ? '...' : '' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end gap-2">
                  <a
                    [routerLink]="['/posts', post.id]"
                    class="text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                    aria-label="Ver detalhes do post {{post.id}}"
                  >
                    Ver
                  </a>
                  <button
                    type="button"
                    (click)="onEdit(post)"
                    class="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
                    aria-label="Editar post {{post.id}}"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    (click)="onDelete(post)"
                    class="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
                    aria-label="Excluir post {{post.id}}"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards (shown only on mobile) -->
      <div *ngIf="!postsService.loading() && paginatedPosts().length > 0" class="md:hidden divide-y divide-gray-200">
        <article *ngFor="let post of paginatedPosts()" class="p-4 hover:bg-gray-50">
          <!-- Post Header -->
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                ID: {{ post.id }}
              </span>
            </div>
          </div>

          <!-- Post Title -->
          <h3 class="text-base font-semibold text-gray-900 mb-2">
            {{ post.title }}
          </h3>

          <!-- Post Body -->
          <p class="text-sm text-gray-600 mb-3 line-clamp-2">
            {{ post.body }}
          </p>

          <!-- Actions -->
          <div class="flex flex-wrap gap-2">
            <a
              [routerLink]="['/posts', post.id]"
              class="flex-1 inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Ver detalhes do post {{post.id}}"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver
            </a>
            <button
              type="button"
              (click)="onEdit(post)"
              class="flex-1 inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Editar post {{post.id}}"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            <button
              type="button"
              (click)="onDelete(post)"
              class="flex-1 inline-flex justify-center items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Excluir post {{post.id}}"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Excluir
            </button>
          </div>
        </article>
      </div>

      <!-- Pagination -->
      <div 
        *ngIf="!postsService.loading() && filteredPosts().length > 0"
        class="px-4 py-3 border-t border-gray-200 sm:px-6"
      >
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-sm text-gray-700">
            Mostrando 
            <span class="font-medium">{{ startIndex() + 1 }}</span>
            até
            <span class="font-medium">{{ endIndex() }}</span>
            de
            <span class="font-medium">{{ filteredPosts().length }}</span>
            resultados
          </div>
          <div class="flex items-center gap-2">
            <label for="pageSize" class="text-sm text-gray-700">Por página:</label>
            <select
              id="pageSize"
              [(ngModel)]="pageSize"
              (ngModelChange)="onPageSizeChange()"
              class="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option [value]="10">10</option>
              <option [value]="25">25</option>
              <option [value]="50">50</option>
            </select>
          </div>
          <nav class="flex gap-2" aria-label="Paginação">
            <button
              type="button"
              (click)="previousPage()"
              [disabled]="currentPage() === 1"
              class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Página anterior"
            >
              Anterior
            </button>
            <span class="px-3 py-1 text-sm text-gray-700">
              Página {{ currentPage() }} de {{ totalPages() }}
            </span>
            <button
              type="button"
              (click)="nextPage()"
              [disabled]="currentPage() === totalPages()"
              class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Próxima página"
            >
              Próxima
            </button>
          </nav>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PostsTableComponent {
  @Output() edit = new EventEmitter<Post>();
  @Output() delete = new EventEmitter<Post>();

  // Convert to signals so computed() can track changes
  private _searchTerm = signal('');
  private _sortBy = signal<'id' | 'title'>('id');
  private _sortOrder = signal<'asc' | 'desc'>('asc');
  private _pageSize = signal(10);
  currentPage = signal(1);
  private searchTimeout: any;

  // Getters and setters for ngModel two-way binding
  get searchTerm(): string {
    return this._searchTerm();
  }
  set searchTerm(value: string) {
    this._searchTerm.set(value);
  }

  get sortBy(): 'id' | 'title' {
    return this._sortBy();
  }
  set sortBy(value: 'id' | 'title') {
    this._sortBy.set(value);
  }

  get sortOrder(): 'asc' | 'desc' {
    return this._sortOrder();
  }
  set sortOrder(value: 'asc' | 'desc') {
    this._sortOrder.set(value);
  }

  get pageSize(): number {
    return this._pageSize();
  }
  set pageSize(value: number) {
    this._pageSize.set(value);
  }

  constructor(public postsService: PostsService) {}

  // Computed signals for filtering and sorting
  filteredPosts = computed(() => {
    let posts = this.postsService.posts();
    
    // Filter by search term (searches in ID, title, and body)
    const searchValue = this._searchTerm();
    if (searchValue) {
      const term = searchValue.toLowerCase();
      posts = posts.filter(post =>
        post.id.toString().includes(term) ||
        post.title.toLowerCase().includes(term) ||
        post.body.toLowerCase().includes(term)
      );
    }

    // Sort
    const sortByValue = this._sortBy();
    const sortOrderValue = this._sortOrder();
    posts = [...posts].sort((a, b) => {
      let comparison = 0;
      if (sortByValue === 'id') {
        comparison = a.id - b.id;
      } else if (sortByValue === 'title') {
        comparison = a.title.localeCompare(b.title);
      }
      return sortOrderValue === 'asc' ? comparison : -comparison;
    });

    return posts;
  });

  totalPages = computed(() => 
    Math.ceil(this.filteredPosts().length / this._pageSize())
  );

  startIndex = computed(() => 
    (this.currentPage() - 1) * this._pageSize()
  );

  endIndex = computed(() => 
    Math.min(this.startIndex() + this._pageSize(), this.filteredPosts().length)
  );

  paginatedPosts = computed(() => 
    this.filteredPosts().slice(this.startIndex(), this.endIndex())
  );

  onSearchChange(term: string): void {
    // Signal is automatically updated via setter when ngModel changes
    // Just debounce the page reset
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
    }, 300);
  }

  onSortChange(): void {
    this.currentPage.set(1);
  }

  onPageSizeChange(): void {
    this.currentPage.set(1);
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

  onEdit(post: Post): void {
    this.edit.emit(post);
  }

  onDelete(post: Post): void {
    this.delete.emit(post);
  }
}

