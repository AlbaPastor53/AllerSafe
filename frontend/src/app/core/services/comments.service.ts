import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import {
  Comment,
  CommentPayload,
  RatingSummary,
  SentimentAnalysis
} from '../models/comment.model';

function extractData<T>(response: ApiResponse<T> | null | undefined): T {
  const data = response?.data;
  if (data === undefined || data === null) throw new Error('INVALID_RESPONSE');
  return data;
}

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly api = inject(ApiService);

  list(eventId: string): Observable<Comment[]> {
    return this.api
      .get<ApiResponse<Comment[]>>(`comments?event=${encodeURIComponent(eventId)}`)
      .pipe(map((response) => extractData(response)));
  }

  summary(eventId: string): Observable<RatingSummary> {
    return this.api
      .get<ApiResponse<RatingSummary>>(
        `comments/summary?event=${encodeURIComponent(eventId)}`
      )
      .pipe(map((response) => extractData(response)));
  }

  sentiment(eventId: string): Observable<SentimentAnalysis> {
    return this.api
      .get<ApiResponse<SentimentAnalysis>>(
        `comments/sentiment?event=${encodeURIComponent(eventId)}`
      )
      .pipe(map((response) => extractData(response)));
  }

  create(payload: CommentPayload): Observable<Comment> {
    return this.api
      .post<ApiResponse<Comment>>('comments', payload)
      .pipe(map((response) => extractData(response)));
  }

  update(id: string, payload: Partial<CommentPayload>): Observable<Comment> {
    return this.api
      .patch<ApiResponse<Comment>>(`comments/${encodeURIComponent(id)}`, payload)
      .pipe(map((response) => extractData(response)));
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`comments/${encodeURIComponent(id)}`);
  }
}
