import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';

import { I18nFacade } from './i18n.facade';

describe('I18nFacade', () => {
  let facade: I18nFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TranslocoService,
          useValue: jasmine.createSpyObj('TranslocoService', ['setActiveLang']),
        },
      ],
    });
    facade = TestBed.inject(I18nFacade);
  });

  afterEach(() => {
    localStorage.removeItem('rns_lang');
  });

  it('language defaults to en', () => {
    expect(facade.language()).toBe('en');
  });

  it('setLanguage() changes language', () => {
    facade.setLanguage('he');
    expect(facade.language()).toBe('he');
  });

  it('toggle() switches en to he', () => {
    facade.toggle();
    expect(facade.language()).toBe('he');
  });

  it('toggle() switches he to en', () => {
    facade.setLanguage('he');
    facade.toggle();
    expect(facade.language()).toBe('en');
  });

  it('isRtl is true when he', () => {
    facade.setLanguage('he');
    expect(facade.isRtl()).toBe(true);
  });

  it('isRtl is false when en', () => {
    expect(facade.isRtl()).toBe(false);
  });

  it('dir is rtl when he', () => {
    facade.setLanguage('he');
    expect(facade.dir()).toBe('rtl');
  });

  it('dir is ltr when en', () => {
    expect(facade.dir()).toBe('ltr');
  });

  it('tr() returns correct field for en', () => {
    const obj = { name_en: 'Soap', name_he: 'סבון' };
    expect(facade.tr(obj, 'name')).toBe('Soap');
  });

  it('tr() returns correct field for he', () => {
    facade.setLanguage('he');
    const obj = { name_en: 'Soap', name_he: 'סבון' };
    expect(facade.tr(obj, 'name')).toBe('סבון');
  });

  it('tr() returns empty string for null', () => {
    expect(facade.tr(null, 'name')).toBe('');
  });
});
