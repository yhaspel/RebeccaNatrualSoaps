import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RnsButtonDirective } from './button.directive';

@Component({
  standalone: true,
  imports: [RnsButtonDirective],
  template: `
    <button rnsButton data-testid="default">Default</button>
    <button rnsButton="secondary" size="sm" data-testid="secondary">Secondary</button>
    <button rnsButton="destructive" data-testid="danger">Delete</button>
    <a rnsButton="link" data-testid="link">Link</a>
    <button rnsButton size="lg" disabled data-testid="disabled">Disabled</button>
  `,
})
class HostComponent {}

describe('RnsButtonDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function classesOf(testId: string): string {
    const el = fixture.nativeElement.querySelector(
      `[data-testid="${testId}"]`,
    ) as HTMLElement;
    return el.className;
  }

  it('applies primary + md classes by default', () => {
    const cls = classesOf('default');
    expect(cls).toContain('bg-sage');
    expect(cls).toContain('text-ivory');
    expect(cls).toContain('min-h-11');
    expect(cls).toContain('rounded-full');
  });

  it('applies secondary + sm sizing', () => {
    const cls = classesOf('secondary');
    expect(cls).toContain('border-sage/40');
    expect(cls).toContain('bg-ivory');
    expect(cls).toContain('min-h-9');
  });

  it('applies destructive (clay) styling', () => {
    const cls = classesOf('danger');
    expect(cls).toContain('bg-clay');
    expect(cls).toContain('hover:bg-clay-dark');
  });

  it('strips pill chrome on the link variant', () => {
    const cls = classesOf('link');
    expect(cls).toContain('!min-h-0');
    expect(cls).toContain('!rounded-none');
    expect(cls).toContain('hover:underline');
  });

  it('applies disabled-state classes alongside size lg', () => {
    const cls = classesOf('disabled');
    expect(cls).toContain('min-h-12');
    expect(cls).toContain('disabled:bg-sage/30');
    expect(cls).toContain('disabled:cursor-not-allowed');
  });
});
