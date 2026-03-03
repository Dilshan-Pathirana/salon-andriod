import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongodbUri:
    process.env.MONGODB_URI ??
    (process.env.NODE_ENV === 'production' ? '' : 'mongodb://127.0.0.1:27017/salon_andriod'),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET ?? 'salon_andriod_dev_secret',
  adminPhone: process.env.ADMIN_PHONE ?? '0712345678',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'admin12345',
  adminFirstName: process.env.ADMIN_FIRST_NAME ?? 'Salon',
  adminLastName: process.env.ADMIN_LAST_NAME ?? 'Admin',
};
