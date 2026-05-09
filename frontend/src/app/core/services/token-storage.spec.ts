import { TestBed } from '@angular/core/testing';
import { TokenStorage } from './token-storage';

describe('TokenStorage', () => {
  let service: TokenStorage;

  beforeEach(() => {
    service = TestBed.inject(TokenStorage);
  });

  afterEach(() => {
    localStorage.removeItem('rns_access');
    localStorage.removeItem('rns_refresh');
  });

  it('read() returns null when nothing stored', () => {
    const result = service.read();
    expect(result.access).toBeNull();
    expect(result.refresh).toBeNull();
  });

  it('write() sets both tokens', () => {
    service.write('a-token', 'r-token');
    expect(localStorage.getItem('rns_access')).toBe('a-token');
    expect(localStorage.getItem('rns_refresh')).toBe('r-token');
  });

  it('read() returns stored tokens', () => {
    service.write('a', 'r');
    const result = service.read();
    expect(result.access).toBe('a');
    expect(result.refresh).toBe('r');
  });

  it('writeAccess() sets only access token', () => {
    service.write('old-a', 'old-r');
    service.writeAccess('new-a');
    expect(localStorage.getItem('rns_access')).toBe('new-a');
    expect(localStorage.getItem('rns_refresh')).toBe('old-r');
  });

  it('clear() removes both tokens', () => {
    service.write('a', 'r');
    service.clear();
    expect(localStorage.getItem('rns_access')).toBeNull();
    expect(localStorage.getItem('rns_refresh')).toBeNull();
  });
});
