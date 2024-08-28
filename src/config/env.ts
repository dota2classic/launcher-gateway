require('dotenv').config();



export const REDIS_URL = () => process.env.REDIS_URL || 'redis://localhost:6379';

export const REDIS_HOST = () => process.env.REDIS_HOST || 'redis'
export const REDIS_PASSWORD = () => process.env.REDIS_PASSWORD || undefined;

export const RECAPTCHA_TOKEN = process.env.RECAPTCHA_TOKEN
export const JWT_SECRET = process.env.PRIVATE_JWT_KEY || 'tmp';

export const profile = process.env.PROFILE;
export const isProd = profile === 'prod';
export const isDev = !isProd;
