import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { Post, CreatePostDto, UpdatePostDto } from '../models/post.interface';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  // Signal-based state
  private postsMap = signal<Map<number, Post>>(new Map());
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Public computed signals
  public posts = computed(() => Array.from(this.postsMap().values()));
  public loading = this.loadingSignal.asReadonly();
  public error = this.errorSignal.asReadonly();

  constructor(private http: HttpClient) {}

  // Load all posts from API
  loadPosts(): Observable<Post[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<Post[]>('/posts').pipe(
      tap(posts => {
        const newMap = new Map<number, Post>();
        posts.forEach(post => newMap.set(post.id, post));
        this.postsMap.set(newMap);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message || 'Erro ao carregar posts');
        return throwError(() => error);
      })
    );
  }

  // Get single post
  getPost(id: number): Observable<Post> {
    // Try cache first
    const cached = this.postsMap().get(id);
    if (cached) {
      return new Observable(observer => {
        observer.next(cached);
        observer.complete();
      });
    }

    // Fetch from API
    this.loadingSignal.set(true);
    return this.http.get<Post>(`/posts/${id}`).pipe(
      tap(post => {
        const currentMap = new Map(this.postsMap());
        currentMap.set(post.id, post);
        this.postsMap.set(currentMap);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message || 'Erro ao carregar post');
        return throwError(() => error);
      })
    );
  }

  // Create new post with optimistic update
  createPost(dto: CreatePostDto): Observable<Post> {
    const tempId = Date.now(); // Temporary ID for optimistic update
    const tempPost: Post = { id: tempId, ...dto };

    // Save previous state for rollback
    const previousMap = new Map(this.postsMap());

    // Optimistic update
    const currentMap = new Map(this.postsMap());
    currentMap.set(tempId, tempPost);
    this.postsMap.set(currentMap);
    this.errorSignal.set(null);

    return this.http.post<Post>('/posts', dto).pipe(
      tap(post => {
        // Replace temporary post with actual post from API
        const newMap = new Map(this.postsMap());
        newMap.delete(tempId);
        newMap.set(post.id, post);
        this.postsMap.set(newMap);
      }),
      catchError(error => {
        // Rollback on error
        this.postsMap.set(previousMap);
        this.errorSignal.set(error.message || 'Erro ao criar post');
        return throwError(() => error);
      })
    );
  }

  // Update post with optimistic update
  updatePost(id: number, dto: UpdatePostDto): Observable<Post> {
    const currentPost = this.postsMap().get(id);
    if (!currentPost) {
      return throwError(() => ({ message: 'Post não encontrado no cache' }));
    }

    // Save previous state for rollback
    const previousMap = new Map(this.postsMap());

    // Optimistic update
    const updatedPost: Post = { ...currentPost, ...dto };
    const currentMap = new Map(this.postsMap());
    currentMap.set(id, updatedPost);
    this.postsMap.set(currentMap);
    this.errorSignal.set(null);

    // Check if this is a locally created post (ID > 100 means it was created with Date.now())
    // JSONPlaceholder only has posts with IDs 1-100
    const isLocalPost = id > 100;
    
    if (isLocalPost) {
      // For local posts, just update the cache without API call
      return new Observable<Post>(observer => {
        observer.next(updatedPost);
        observer.complete();
      });
    }

    return this.http.put<Post>(`/posts/${id}`, { ...currentPost, ...dto }).pipe(
      tap(post => {
        const newMap = new Map(this.postsMap());
        newMap.set(post.id, post);
        this.postsMap.set(newMap);
      }),
      catchError(error => {
        // Rollback on error
        this.postsMap.set(previousMap);
        this.errorSignal.set(error.message || 'Erro ao atualizar post');
        return throwError(() => error);
      })
    );
  }

  // Delete post with optimistic update
  deletePost(id: number): Observable<void> {
    const currentPost = this.postsMap().get(id);
    if (!currentPost) {
      return throwError(() => ({ message: 'Post não encontrado no cache' }));
    }

    // Save previous state for rollback
    const previousMap = new Map(this.postsMap());

    // Optimistic update
    const currentMap = new Map(this.postsMap());
    currentMap.delete(id);
    this.postsMap.set(currentMap);
    this.errorSignal.set(null);

    // Check if this is a locally created post (ID > 100)
    const isLocalPost = id > 100;
    
    if (isLocalPost) {
      // For local posts, just update the cache without API call
      return new Observable<void>(observer => {
        observer.next();
        observer.complete();
      });
    }

    return this.http.delete<void>(`/posts/${id}`).pipe(
      catchError(error => {
        // Rollback on error
        this.postsMap.set(previousMap);
        this.errorSignal.set(error.message || 'Erro ao excluir post');
        return throwError(() => error);
      })
    );
  }

  // Get post from cache (synchronous)
  getPostFromCache(id: number): Post | undefined {
    return this.postsMap().get(id);
  }

  // Clear error
  clearError(): void {
    this.errorSignal.set(null);
  }
}

