import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults title and body to empty', () => {
    expect(component.title).toBe('');
    expect(component.body).toBe('');
  });

  it('accepts title input', () => {
    component.title = 'No items';
    expect(component.title).toBe('No items');
  });

  it('accepts body input', () => {
    component.body = 'Try again later';
    expect(component.body).toBe('Try again later');
  });
});
