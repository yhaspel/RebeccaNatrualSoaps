import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinnerComponent } from './spinner.component';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SpinnerComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: { common: { loading: 'Loading...' } } },
          translocoConfig: { defaultLang: 'en', availableLangs: ['en'] },
        }),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('has status role', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[role="status"]')).toBeTruthy();
  });

  it('defaults label to empty string', () => {
    expect(component.label).toBe('');
  });
});
