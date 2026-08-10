import { serializeUser } from './user.serializer';
import { User } from '../models/user.model';
import { UserRole } from '../../common/enums/user-role.enum';

describe('user.serializer', () => {
  it('never exposes the password hash', () => {
    const user = {
      id: 'user-1',
      email: 'john@example.com',
      name: 'John Doe',
      role: UserRole.CUSTOMER,
      password: 'supersecret',
    } as unknown as User;

    const result = serializeUser(user);
    expect(result).toEqual({
      id: 'user-1',
      email: 'john@example.com',
      name: 'John Doe',
      role: UserRole.CUSTOMER,
    });
    expect(result).not.toHaveProperty('password');
  });
});
