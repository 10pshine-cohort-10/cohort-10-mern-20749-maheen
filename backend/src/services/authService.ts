import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserById } from '../repositories/userRepository';
import { AppError } from '../utils/AppError';
import { toPublicUser, type PublicUser } from '../types/user';
import type { LoginInput, SignupInput } from '../validators/authSchemas';

const SALT_ROUNDS = 12;

// compared against when the email doesn't exist, so a login takes about the same time either way.
// otherwise response time would tell an attacker which emails have accounts
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', SALT_ROUNDS);

export async function signup(input: SignupInput): Promise<PublicUser> {
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const userId = await createUser(input.name, input.email, passwordHash);

  const user = await findUserById(userId);
  if (!user) {
    throw new AppError('Could not create the account', 500);
  }
  return toPublicUser(user);
}

export async function login(input: LoginInput): Promise<PublicUser> {
  const user = await findUserByEmail(input.email);
  const passwordMatches = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);

  // same message for both cases so nobody can check which emails are registered
  if (!user || !passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }
  return toPublicUser(user);
}
