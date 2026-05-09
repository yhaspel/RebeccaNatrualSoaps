import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'rns-public-shell',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen flex-col bg-cream text-ink">
      <rns-header></rns-header>
      <main id="main" class="flex-1">
        <router-outlet></router-outlet>
      </main>
      <rns-footer></rns-footer>
    </div>
  `,
})
export class PublicShellComponent {}
