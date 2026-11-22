import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { ChatMessage } from '../../../core/models/chatbot.model';
import { ChatbotService } from '../../../core/services/chatbot.service';

const WELCOME_MESSAGE =
  '¡Hola! Soy el asistente de AllerSafe. Dime el ingrediente que quieres sustituir, la receta y tu restricción (alergia, intolerancia o celiaquía) y te propondré alternativas adecuadas.';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      @if (open()) {
        <section
          class="flex max-h-[70vh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-[#5A4530] bg-[#24170F] shadow-2xl"
          aria-label="Chat del asistente de AllerSafe"
        >
          <header class="flex items-center gap-2 border-b border-[#5A4530] px-4 py-3">
            <span
              class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-gray-950"
            >A</span>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-[#F5F0E6]">Asistente AllerSafe</p>
              <p class="text-xs text-[#B9AA98]">Sustitución de ingredientes</p>
            </div>
            <button
              type="button"
              class="ml-auto grid h-8 w-8 place-items-center rounded-lg text-[#B9AA98] transition-colors hover:bg-[#3A291D] hover:text-[#F5F0E6]"
              (click)="toggle()"
              aria-label="Cerrar chat"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <div #history class="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            @for (message of messages(); track $index) {
              <div class="flex" [class.justify-end]="message.role === 'user'">
                @if (message.role === 'user') {
                  <p class="max-w-[85%] whitespace-pre-line rounded-xl bg-brand px-3 py-2 leading-relaxed text-gray-950">{{ message.content }}</p>
                } @else {
                  <p class="max-w-[85%] whitespace-pre-line rounded-xl bg-[#3A291D] px-3 py-2 leading-relaxed text-[#F5F0E6]">{{ message.content }}</p>
                }
              </div>
            }

            @if (loading()) {
              <div class="flex items-center gap-2 text-xs text-[#B9AA98]">
                <span class="h-2 w-2 animate-pulse rounded-full bg-brand"></span>
                Escribiendo…
              </div>
            }
          </div>

          @if (error()) {
            <p class="px-4 pb-2 text-xs text-[#F0BDB2]">{{ error() }}</p>
          }

          <div class="flex items-end gap-2 border-t border-[#5A4530] p-3">
            <textarea
              rows="1"
              class="form-input max-h-24 resize-none"
              placeholder="Escribe tu pregunta…"
              aria-label="Mensaje para el asistente"
              [value]="draft()"
              [disabled]="loading()"
              (input)="onDraftChange($event)"
              (keydown)="onKeydown($event)"
            ></textarea>
            <button
              type="button"
              class="button-primary grid h-10 w-10 shrink-0 place-items-center !px-0"
              (click)="send()"
              [disabled]="loading() || !draft().trim()"
              aria-label="Enviar mensaje"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 12l16-8-6 16-3-7-7-1z" />
              </svg>
            </button>
          </div>
        </section>
      }

      <button
        type="button"
        class="grid h-14 w-14 place-items-center rounded-full bg-brand text-gray-950 shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-dark"
        (click)="toggle()"
        [attr.aria-expanded]="open()"
        aria-label="Abrir asistente de ingredientes"
      >
        @if (open()) {
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        } @else {
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12a8 8 0 01-8 8H7l-4 2v-6a8 8 0 018-8h2a8 8 0 018 4z" />
          </svg>
        }
      </button>
    </div>
  `
})
export class Chatbot {
  private readonly chatbotService = inject(ChatbotService);
  private readonly history = viewChild<ElementRef<HTMLDivElement>>('history');

  protected readonly open = signal(false);
  protected readonly messages = signal<ChatMessage[]>([
    { role: 'assistant', content: WELCOME_MESSAGE }
  ]);
  protected readonly draft = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected toggle(): void {
    this.open.update((value) => !value);
    this.error.set(null);
    this.scrollToBottom();
  }

  protected onDraftChange(event: Event): void {
    this.draft.set((event.target as HTMLTextAreaElement).value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.send();
    }
  }

  protected async send(): Promise<void> {
    const text = this.draft().trim();
    if (!text || this.loading()) return;

    this.appendMessage({ role: 'user', content: text });
    this.draft.set('');
    this.error.set(null);
    this.loading.set(true);
    this.scrollToBottom();

    try {
      const reply = await this.chatbotService.send(this.messages());
      this.appendMessage({ role: 'assistant', content: reply });
      this.scrollToBottom();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se ha podido enviar el mensaje.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  private appendMessage(message: ChatMessage): void {
    this.messages.update((messages) => [...messages, message].slice(-20));
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const element = this.history()?.nativeElement;
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    });
  }
}
