import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Comment, CreateCommentDto, UpdateCommentDto } from '../models/comment.interface';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  // Signal-based state - Map of postId to comments
  private commentsMap = signal<Map<number, Comment[]>>(new Map());
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Public signals
  public loading = this.loadingSignal.asReadonly();
  public error = this.errorSignal.asReadonly();

  constructor(private http: HttpClient) {}

  // Get comments for a specific post
  getCommentsForPost(postId: number): Observable<Comment[]> {
    // Try cache first
    const cached = this.commentsMap().get(postId);
    if (cached) {
      return new Observable(observer => {
        observer.next(cached);
        observer.complete();
      });
    }

    // Fetch from API
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<Comment[]>(`/posts/${postId}/comments`).pipe(
      tap(comments => {
        const currentMap = new Map(this.commentsMap());
        currentMap.set(postId, comments);
        this.commentsMap.set(currentMap);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message || 'Erro ao carregar comentários');
        return throwError(() => error);
      })
    );
  }

  // Get comments from cache (synchronous)
  getCommentsFromCache(postId: number): Comment[] {
    return this.commentsMap().get(postId) || [];
  }

  // Create new comment with optimistic update
  createComment(dto: CreateCommentDto): Observable<Comment> {
    const tempId = Date.now(); // Temporary ID for optimistic update
    const tempComment: Comment = { id: tempId, ...dto };

    // Save previous state for rollback
    const previousMap = new Map(this.commentsMap());

    // Optimistic update
    const currentComments = this.commentsMap().get(dto.postId) || [];
    const newComments = [...currentComments, tempComment];
    const currentMap = new Map(this.commentsMap());
    currentMap.set(dto.postId, newComments);
    this.commentsMap.set(currentMap);
    this.errorSignal.set(null);

    return this.http.post<Comment>('/comments', dto).pipe(
      tap(comment => {
        // Replace temporary comment with actual comment from API
        const comments = this.commentsMap().get(dto.postId) || [];
        const filteredComments = comments.filter(c => c.id !== tempId);
        const newMap = new Map(this.commentsMap());
        newMap.set(dto.postId, [...filteredComments, comment]);
        this.commentsMap.set(newMap);
      }),
      catchError(error => {
        // Rollback on error
        this.commentsMap.set(previousMap);
        this.errorSignal.set(error.message || 'Erro ao criar comentário');
        return throwError(() => error);
      })
    );
  }

  // Update comment with optimistic update
  updateComment(commentId: number, postId: number, dto: UpdateCommentDto): Observable<Comment> {
    const currentComments = this.commentsMap().get(postId) || [];
    const commentIndex = currentComments.findIndex(c => c.id === commentId);
    
    if (commentIndex === -1) {
      return throwError(() => ({ message: 'Comentário não encontrado no cache' }));
    }

    const currentComment = currentComments[commentIndex];
    
    // Save previous state for rollback
    const previousMap = new Map(this.commentsMap());

    // Optimistic update
    const updatedComment: Comment = { ...currentComment, ...dto };
    const newComments = [...currentComments];
    newComments[commentIndex] = updatedComment;
    const currentMap = new Map(this.commentsMap());
    currentMap.set(postId, newComments);
    this.commentsMap.set(currentMap);
    this.errorSignal.set(null);

    // Check if this is a locally created comment (ID > 500 means it was created with Date.now())
    // JSONPlaceholder only has comments with IDs 1-500
    const isLocalComment = commentId > 500;
    
    if (isLocalComment) {
      // For local comments, just update the cache without API call
      // since JSONPlaceholder doesn't persist our created comments
      return new Observable<Comment>(observer => {
        observer.next(updatedComment);
        observer.complete();
      });
    }

    // For existing API comments, make the PUT request
    return this.http.put<Comment>(`/comments/${commentId}`, { 
      ...currentComment, 
      ...dto 
    }).pipe(
      tap(comment => {
        const comments = this.commentsMap().get(postId) || [];
        const idx = comments.findIndex(c => c.id === commentId);
        if (idx !== -1) {
          const updated = [...comments];
          updated[idx] = comment;
          const newMap = new Map(this.commentsMap());
          newMap.set(postId, updated);
          this.commentsMap.set(newMap);
        }
      }),
      catchError(error => {
        // Rollback on error
        this.commentsMap.set(previousMap);
        this.errorSignal.set(error.message || 'Erro ao atualizar comentário');
        return throwError(() => error);
      })
    );
  }

  // Delete comment with optimistic update
  deleteComment(commentId: number, postId: number): Observable<void> {
    const currentComments = this.commentsMap().get(postId) || [];
    const commentExists = currentComments.some(c => c.id === commentId);
    
    if (!commentExists) {
      return throwError(() => ({ message: 'Comentário não encontrado no cache' }));
    }

    // Save previous state for rollback
    const previousMap = new Map(this.commentsMap());

    // Optimistic update
    const newComments = currentComments.filter(c => c.id !== commentId);
    const currentMap = new Map(this.commentsMap());
    currentMap.set(postId, newComments);
    this.commentsMap.set(currentMap);
    this.errorSignal.set(null);

    // Check if this is a locally created comment (ID > 500)
    const isLocalComment = commentId > 500;
    
    if (isLocalComment) {
      // For local comments, just update the cache without API call
      return new Observable<void>(observer => {
        observer.next();
        observer.complete();
      });
    }

    // For existing API comments, make the DELETE request
    return this.http.delete<void>(`/comments/${commentId}`).pipe(
      catchError(error => {
        // Rollback on error
        this.commentsMap.set(previousMap);
        this.errorSignal.set(error.message || 'Erro ao excluir comentário');
        return throwError(() => error);
      })
    );
  }

  // Clear comments cache for a post
  clearCommentsCache(postId: number): void {
    const currentMap = new Map(this.commentsMap());
    currentMap.delete(postId);
    this.commentsMap.set(currentMap);
  }

  // Clear error
  clearError(): void {
    this.errorSignal.set(null);
  }
}

