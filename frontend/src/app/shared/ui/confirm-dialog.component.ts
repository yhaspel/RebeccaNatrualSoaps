import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { RnsButtonDirective, RnsButtonVariant } from './button.directive';

let _idCounter = 0;

/**
 * Focus-trapped confirmation dialog built on the native `<dialog>` element.
 *
 * `dlg.showModal()` gives us focus trapping, `Esc` to dismiss, and automatic
 * focus return to the trigger when the dialog closes — all without depending
 * on @angular/cdk.
 *
 * Usage:
 *   <rns-confirm-dialog
 *     #dlg
 *     [open]="confirming()"
 *     [title]="'admin.products.deleteConfirmTitle' | transloco"
 *     [body]="'admin.products.deleteConfirm' | transloco"
 *     [confirmLabel]="'common.delete' | transloco"
 *     [cancelLabel]="'common.cancel' | transloco"
 *     variant="destructive"
 *     (confirm)="onConfirmed()"
 *     (cancel)="confirming.set(false)"
 *   ></rns-confirm-dialog>
 *
 *   <button (click)="confirming.set(true)">Delete</button>
 */
@Component({
  selector: 'rns-confirm-dialog',
  standalone: true,
  imports: [RnsButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog
      #dlg
      class="rounded-soft bg-ivory p-0 text-ink shadow-soft backdrop:bg-ink/40 max-w-md w-[min(92vw,28rem)]"
      [attr.aria-labelledby]="titleId"
      [attr.aria-describedby]="bodyId"
      (close)="handleNativeClose()"
    >
      <div class="p-6">
        <h2 [id]="titleId" class="font-serif text-xl text-ink">{{ title() }}</h2>
        <p [id]="bodyId" class="mt-3 text-sm leading-relaxed text-ink/70">
          {{ body() }}
        </p>
        <div class="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" rnsButton="secondary" size="md" (click)="onCancel()">
            {{ cancelLabel() }}
          </button>
          <button
            #confirmBtn
            type="button"
            [rnsButton]="variant()"
            size="md"
            (click)="onConfirm()"
          >
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    </dialog>
  `,
})
export class ConfirmDialogComponent {
  title = input.required<string>();
  body = input.required<string>();
  confirmLabel = input.required<string>();
  cancelLabel = input<string>('Cancel');
  variant = input<RnsButtonVariant>('primary');
  open = input<boolean>(false);

  confirm = output<void>();
  cancel = output<void>();

  protected dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');
  protected confirmBtn = viewChild<ElementRef<HTMLButtonElement>>('confirmBtn');

  protected readonly titleId = `rns-confirm-title-${++_idCounter}`;
  protected readonly bodyId = `rns-confirm-body-${_idCounter}`;

  // Tracks whether the close was driven by us (via a button click) or the
  // browser (via the Esc key). Browser-driven closes should fire `cancel`.
  private dismissing = signal(false);

  constructor() {
    effect(() => {
      const should = this.open();
      const el = this.dlg().nativeElement;
      if (should && !el.open) {
        el.showModal();
        // Native dialogs auto-focus the first focusable element. Move focus
        // to the confirm button so Enter triggers the primary action.
        queueMicrotask(() => this.confirmBtn()?.nativeElement.focus());
      } else if (!should && el.open) {
        this.dismissing.set(true);
        el.close();
      }
    });
  }

  protected onConfirm(): void {
    this.dismissing.set(true);
    this.confirm.emit();
  }

  protected onCancel(): void {
    this.dismissing.set(true);
    this.cancel.emit();
  }

  /** Fires when the user dismisses with Esc, or when we close()'d ourselves. */
  protected handleNativeClose(): void {
    if (this.dismissing()) {
      this.dismissing.set(false);
      return;
    }
    // Esc-driven close — emit cancel so parent can sync its state.
    this.cancel.emit();
  }
}
