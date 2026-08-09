import { serializeUser } from './user.serializer';

describe('user.serializer', () => {
  it('never exposes the password hash', () => {
    const user = {
      id: 'user-1',
      email: 'john@example.com',
      name: 'John Doe',
      role: 'Customer',
      password: 'supersecret',
    } as any;

    const result = serializeUser(user);
    expect(result).toEqual({
      id: 'user-1',
      email: 'john@example.com',
      name: 'John Doe',
      role: 'Customer',
    });
    expect(result).not.toHaveProperty('password');
  });
});
