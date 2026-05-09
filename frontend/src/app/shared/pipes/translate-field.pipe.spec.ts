import { TestBed } from '@angular/core/testing';
import { TranslateFieldPipe } from './translate-field.pipe';
import { I18nFacade } from '../../abstraction/i18n.facade';

describe('TranslateFieldPipe', () => {
  let pipe: TranslateFieldPipe;
  let mockI18n: jasmine.SpyObj<I18nFacade>;

  beforeEach(() => {
    mockI18n = jasmine.createSpyObj('I18nFacade', ['tr']);
    TestBed.configureTestingModule({
      providers: [
        TranslateFieldPipe,
        { provide: I18nFacade, useValue: mockI18n },
      ],
    });
    pipe = TestBed.inject(TranslateFieldPipe);
  });

  it('returns name_en when lang=en', () => {
    const obj = { name_en: 'Soap', name_he: 'סבון' };
    mockI18n.tr.and.returnValue('Soap');
    expect(pipe.transform(obj, 'name')).toBe('Soap');
    expect(mockI18n.tr).toHaveBeenCalledWith(obj, 'name');
  });

  it('returns name_he when lang=he', () => {
    const obj = { name_en: 'Soap', name_he: 'סבון' };
    mockI18n.tr.and.returnValue('סבון');
    expect(pipe.transform(obj, 'name')).toBe('סבון');
  });

  it('returns empty string for null object', () => {
    mockI18n.tr.and.returnValue('');
    expect(pipe.transform(null, 'name')).toBe('');
  });
});
