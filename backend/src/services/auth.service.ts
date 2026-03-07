import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';
import { User } from '@prisma/client';

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// 生成访问令牌
export function generateAccessToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// 生成刷新令牌
export function generateRefreshToken(): string {
  return uuidv4().replace(/-/g, '');
}

// 哈希密码
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// 验证密码
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// 用户注册
export async function register(input: RegisterInput): Promise<{ user: User; tokens: TokenPair }> {
  // 检查邮箱是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new AppError('EMAIL_EXISTS', '该邮箱已被注册', 409);
  }

  // 哈希密码
  const hashedPassword = await hashPassword(input.password);

  // 创建用户
  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      name: input.name,
    },
  });

  // 生成令牌
  const tokens = generateTokens(user.id, user.email);

  // 保存刷新令牌
  await saveRefreshToken(user.id, tokens.refreshToken);

  return { user, tokens };
}

// 用户登录
export async function login(input: LoginInput): Promise<{ user: User; tokens: TokenPair }> {
  // 查找用户
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new AppError('INVALID_CREDENTIALS', '邮箱或密码错误', 401);
  }

  // 验证密码
  const isValid = await verifyPassword(input.password, user.password);

  if (!isValid) {
    throw new AppError('INVALID_CREDENTIALS', '邮箱或密码错误', 401);
  }

  // 生成令牌
  const tokens = generateTokens(user.id, user.email);

  // 保存刷新令牌
  await saveRefreshToken(user.id, tokens.refreshToken);

  return { user: { ...user, password: '' as any }, tokens };
}

// 刷新令牌
export async function refreshToken(refreshToken: string): Promise<TokenPair> {
  // 验证刷新令牌
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!tokenRecord) {
    throw new AppError('INVALID_TOKEN', '无效的刷新令牌', 401);
  }

  // 检查是否过期
  if (tokenRecord.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
    throw new AppError('TOKEN_EXPIRED', '刷新令牌已过期', 401);
  }

  // 生成新的令牌对
  const tokens = generateTokens(tokenRecord.user.id, tokenRecord.user.email);

  // 删除旧的刷新令牌
  await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

  // 保存新的刷新令牌
  await saveRefreshToken(tokenRecord.user.id, tokens.refreshToken);

  return tokens;
}

// 登出
export async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
}

// 获取用户信息
export async function getUserById(userId: string): Promise<Omit<User, 'password'>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('USER_NOT_FOUND', '用户不存在', 404);
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// 辅助函数：生成令牌对
function generateTokens(userId: string, email: string): TokenPair {
  const accessToken = generateAccessToken(userId, email);
  const refreshToken = generateRefreshToken();

  return { accessToken, refreshToken };
}

// 辅助函数：保存刷新令牌
async function saveRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 天有效期

  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
}
