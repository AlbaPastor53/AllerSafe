export interface CommentAuthor {
  _id: string;
  name: string;
  role?: string;
}

export interface Comment {
  _id: string;
  user_id: CommentAuthor | string;
  event_id: string;
  rating: number;
  comment: string;
  isActive: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CommentPayload {
  event_id: string;
  rating: number;
  comment: string;
}

export interface StarCount {
  stars: number;
  count: number;
  percentage: number;
}

export interface AiReviewSummary {
  positiveAspects: string;
  negativeAspects: string;
  summary: string;
}

export interface RatingSummary {
  total: number;
  average: number;
  distribution: StarCount[];
  ai?: AiReviewSummary | null;
}

export type SentimentLabel = 'Positivo' | 'Neutral' | 'Negativo';

export interface SentimentCount {
  label: SentimentLabel;
  count: number;
  percentage: number;
}

export interface SentimentAnalysis extends RatingSummary {
  enoughData: boolean;
  message?: string;
  analyzed: number;
  sentiment: SentimentLabel | null;
  sentiments: SentimentCount[];
  positiveAspects: string;
  negativeAspects: string;
  summary: string;
}

export function commentAuthorName(comment: Comment): string {
  const user = comment.user_id;
  if (user && typeof user !== 'string') return user.name || 'Usuario';
  return 'Usuario';
}

export function commentStars(rating: number): string {
  const safe = Math.max(0, Math.min(5, Math.round(rating)));
  return '★'.repeat(safe) + '☆'.repeat(5 - safe);
}
