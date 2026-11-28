// a user as stored in the database (includes the password hash)
export interface UserRecord {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

// what we're allowed to send back to the client
export interface PublicUser {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

export function toPublicUser(user: UserRecord): PublicUser {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}
