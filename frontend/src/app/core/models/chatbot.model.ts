export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatbotResponse {
  success?: boolean;
  data: { reply: string };
}
