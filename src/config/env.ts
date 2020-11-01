require('dotenv').config();


export const DISCORD_SERVER_ID = () => process.env.DISCORD_SERVER_ID;
export const DISCORD_API_TOKEN = () => process.env.DISCORD_API_TOKEN;

export const DISCORD_GATEWAY_HOST = () => process.env.DISCORD_GATEWAY_HOST || undefined;
export const CORE_GATEWAY_HOST = () => process.env.CORE_GATEWAY_HOST || undefined;
export const REDIS_URL = () => process.env.REDIS_URL || 'redis://localhost:6379';
export const REDIS_PASSWORD = () => process.env.REDIS_PASSWORD || undefined;

export const DB_USERNAME = () => process.env.POSTGRES_USERNAME
export const DB_PASSWORD = () => process.env.POSTGRES_PASSWORD
export const DB_HOST = () => process.env.POSTGRES_HOST

export const profile = process.env.PROFILE;
export const isProd = profile === 'prod';
export const isDev = !isProd;
