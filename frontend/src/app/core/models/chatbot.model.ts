export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatbotResponse {
  success?: boolean;
  data: { reply: string };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqEventContext {
  name: string;
  description: string;
  categories: string[];
  host: string;
  location: string;
  classNumber: number;
  date: string;
  time: string;
  price: number;
  capacity: number;
}

export interface FaqResponse {
  success?: boolean;
  data: { faqs: FaqItem[] };
}
