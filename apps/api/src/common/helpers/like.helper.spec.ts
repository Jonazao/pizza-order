import { escapeLikeWildcards } from './like.helper';

describe('escapeLikeWildcards', () => {
  it('returns a plain term unchanged', () => {
    expect(escapeLikeWildcards('pepperoni')).toBe('pepperoni');
  });

  it('escapes percent signs', () => {
    expect(escapeLikeWildcards('50%')).toBe('50\\%');
  });

  it('escapes underscores', () => {
    expect(escapeLikeWildcards('a_b')).toBe('a\\_b');
  });

  it('escapes backslashes', () => {
    expect(escapeLikeWildcards('a\\b')).toBe('a\\\\b');
  });

  it('escapes all wildcard characters together', () => {
    expect(escapeLikeWildcards('%\\_')).toBe('\\%\\\\\\_');
  });

  it('leaves an empty string empty', () => {
    expect(escapeLikeWildcards('')).toBe('');
  });
});
