import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

function requireSecret(key: string, devFallback: string): string {
  const value = process.env[key];
  if (!value) {
    if (isProduction) {
      throw new Error(
        `[ENV] Missing required secret: "${key}". Set this environment variable before starting the server in production.`
      );
    }
    return devFallback;
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongodbUri:
    process.env.MONGODB_URI ??
    (isProduction ? '' : 'mongodb://127.0.0.1:27017/salon_andriod'),
  // CORS_ORIGIN supports comma-separated list, falls back to CLIENT_URL
  corsOrigins: (
    process.env.CORS_ORIGIN ??
    process.env.CLIENT_URL ??
    'http://localhost:5173'
  ).split(',').map(s => s.trim()).filter(Boolean),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  // Separate secrets for access and refresh tokens — must be set in production
  jwtAccessSecret: requireSecret('JWT_ACCESS_SECRET', 'dev_only_access_secret_do_not_use_in_prod'),
  jwtRefreshSecret: requireSecret('JWT_REFRESH_SECRET', 'dev_only_refresh_secret_do_not_use_in_prod'),
  adminPhone: process.env.ADMIN_PHONE ?? (isProduction ? '' : '0700000000'),
  adminPassword: process.env.ADMIN_PASSWORD ?? '',
  adminFirstName: process.env.ADMIN_FIRST_NAME ?? 'Salon',
  adminLastName: process.env.ADMIN_LAST_NAME ?? 'Admin',
};
