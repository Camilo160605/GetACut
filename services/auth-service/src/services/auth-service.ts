import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { users, type User } from '../db/schema';

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export interface JwtPayload {
  userId: number;
  role: 'client' | 'barber' | 'admin';
  email: string;
}

export interface AuthResult {
  user: Omit<User, 'password'>;
  token: string;
}

const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

const findUserByEmail = async (email: string): Promise<User | undefined> => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result[0];
};

export const registerClient = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResult> => {
  const existing = await findUserByEmail(email);
  if (existing) {
    const error = new Error('Email already registered');
    (error as NodeJS.ErrnoException).code = 'DUPLICATE_EMAIL';
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const [newUser] = await db
    .insert(users)
    .values({ name, email, password: hashedPassword, role: 'client' })
    .returning();

  if (!newUser) {
    throw new Error('Failed to create user');
  }

  const { password: _pwd, ...userWithoutPassword } = newUser;

  const token = generateToken({
    userId: newUser.id,
    role: newUser.role,
    email: newUser.email,
  });

  return { user: userWithoutPassword, token };
};

export const createBarber = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResult> => {
  const existing = await findUserByEmail(email);
  if (existing) {
    const error = new Error('Email already registered');
    (error as NodeJS.ErrnoException).code = 'DUPLICATE_EMAIL';
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const [newUser] = await db
    .insert(users)
    .values({ name, email, password: hashedPassword, role: 'barber' })
    .returning();

  if (!newUser) {
    throw new Error('Failed to create barber');
  }

  const { password: _pwd, ...userWithoutPassword } = newUser;

  const token = generateToken({
    userId: newUser.id,
    role: newUser.role,
    email: newUser.email,
  });

  return { user: userWithoutPassword, token };
};

export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error('Invalid credentials');
  }

  const { password: _pwd, ...userWithoutPassword } = user;

  const token = generateToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  return { user: userWithoutPassword, token };
};

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded as JwtPayload;
};
