import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ChatMessage, ChatbotResponse } from '../models/chatbot.model';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private readonly baseUrl = environment.CHATBOT_API_URL;
  // La IA puede tardar más que la API REST, por eso usa su propio timeout.
  private readonly requestTimeout = 30000;

  async send(messages: ChatMessage[]): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(`${this.baseUrl}/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
        signal: controller.signal
      });

      const body = (await response.json().catch(() => null)) as
        | (ChatbotResponse & { error?: { message?: string } })
        | null;

      if (!response.ok) {
        throw new Error(
          body?.error?.message ?? 'No se ha podido obtener una respuesta del asistente.'
        );
      }

      const reply = body?.data?.reply?.trim();
      if (!reply) {
        throw new Error('El asistente no ha devuelto una respuesta.');
      }

      return reply;
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error('El asistente tarda demasiado. Inténtalo de nuevo.');
      }
      if (error instanceof TypeError) {
        throw new Error(
          'No se puede conectar con el asistente. Comprueba que backend_ia esté en marcha.'
        );
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}
