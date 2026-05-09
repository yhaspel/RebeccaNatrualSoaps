import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { AdminFacade } from '../../../abstraction/admin.facade';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';

@Component({
  selector: 'rns-admin-messages',
  standalone: true,
  imports: [TranslocoPipe, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 class="font-serif text-3xl text-ink">{{ 'admin.messages.title' | transloco }}</h1>

      @if (admin.messages().length === 0) {
        <div class="mt-8">
          <rns-empty-state [title]="'admin.messages.empty' | transloco"></rns-empty-state>
        </div>
      } @else {
        <ul class="mt-6 space-y-3">
          @for (m of admin.messages(); track m.id) {
            <li
              class="rounded-soft bg-cream p-5 shadow-soft"
              [class.opacity-60]="m.handled"
            >
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="font-medium text-ink">
                    {{ m.name }}
                    <span class="ms-2 text-xs text-ink/50">&lt;{{ m.email }}&gt;</span>
                  </p>
                  @if (m.subject) {
                    <p class="mt-1 text-sm text-ink/70">{{ m.subject }}</p>
                  }
                  <p class="mt-1 text-xs uppercase tracking-wide text-ink/50">
                    {{ formatDate(m.created_at) }} · {{ m.language }}
                  </p>
                </div>
                <label class="inline-flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    class="h-4 w-4 accent-sage"
                    [checked]="m.handled"
                    (change)="admin.toggleHandled(m)"
                  />
                  {{ 'admin.messages.handled' | transloco }}
                </label>
              </div>
              <p class="mt-3 whitespace-pre-line text-sm text-ink/80">{{ m.body }}</p>
            </li>
          }
        </ul>
      }
    </section>
  `,
})
export class AdminMessagesComponent implements OnInit {
  protected admin = inject(AdminFacade);

  ngOnInit(): void {
    this.admin.loadMessages();
  }

  formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }
}
