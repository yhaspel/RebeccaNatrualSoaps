import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults tone to info', () => {
    expect(component.tone).toBe('info');
  });

  it('renders an alert role element', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[role="alert"]')).toBeTruthy();
  });

  it('accepts error tone', () => {
    component.tone = 'error';
    expect(component.tone).toBe('error');
  });

  it('accepts success tone', () => {
    component.tone = 'success';
    expect(component.tone).toBe('success');
  });
});
