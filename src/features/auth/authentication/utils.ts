import jwt from 'jsonwebtoken';
import { DatabaseInterface } from '../../databases';

const DEFAULT_REFRESH_EXPIRES_IN = 60 * 60; // 1 hour
const DEFAULT_EXPIRES_IN = 60 * 30;         // 30 minutes

export const generateTokens = (
  payload: object,
  secret: string,
  expiresIn: number | string = DEFAULT_EXPIRES_IN,
  refreshExpiresIn: number | string = DEFAULT_REFRESH_EXPIRES_IN
) => {
  const accessToken = jwt.sign(payload, secret, { expiresIn });
  const refreshToken = jwt.sign(payload, secret, { expiresIn: refreshExpiresIn });
  return { accessToken, refreshToken };
}

export const validateToken = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export const saveAuthDetails = async (
  database: DatabaseInterface,
  userId: string,
  strategy: string,
  client: string,
  tokens: any,
  expiresIn: number | string = DEFAULT_EXPIRES_IN,
  refreshExpiresIn: number | string = DEFAULT_REFRESH_EXPIRES_IN
) => {
  await database.insert('auth', {
    userId,
    strategy,
    client,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + Number(expiresIn) * 1000),
    refreshExpiresAt: new Date(Date.now() + Number(refreshExpiresIn) * 1000),
  });
}

export const ensureUserExists = async (database: DatabaseInterface, entityName: string, identifier: string, data: any): Promise<any> => {
  const [exists] = await database.get(entityName, { [identifier]: data[identifier] });
  
  if (!exists)
    return await database.insert(entityName, data);

  return exists;
}
