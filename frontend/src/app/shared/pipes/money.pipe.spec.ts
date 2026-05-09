import { TestBed } from '@angular/core/testing';
import { MoneyPipe } from './money.pipe';
import { I18nFacade } from '../../abstraction/i18n.facade';
import { signal } from '@angular/core';

describe('MoneyPipe', () => {
  let pipe: MoneyPipe;
  const langSignal = signal<'en' | 'he'>('en');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MoneyPipe,
        {
          provide: I18nFacade,
          useValue: { language: langSignal },
        },
      ],
    });
    pipe = TestBed.inject(MoneyPipe);
    langSignal.set('en');
  });

  it('transforms cents to formatted money', () => {
    const result = pipe.transform(5000);
    expect(result).toContain('50');
  });

  it('returns empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });
});
