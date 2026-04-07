CREATE TYPE "Role" AS ENUM ('ADMIN', 'CLIENT');
CREATE TYPE "BookingStatus" AS ENUM ('BOOKED', 'IN_SERVICE', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE "ScheduleStatus" AS ENUM ('OPEN', 'CLOSED', 'HOLIDAY');
CREATE TYPE "ServiceCategory" AS ENUM ('HAIRCUT', 'BEARD', 'COMBO', 'PREMIUM');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "phoneNumber" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'CLIENT',
  "profileImageUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "RefreshToken" (
  "id" TEXT PRIMARY KEY,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

CREATE TABLE "Service" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "icon" TEXT NOT NULL,
  "category" "ServiceCategory" NOT NULL DEFAULT 'HAIRCUT',
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "TeamMember" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "experienceYears" INTEGER NOT NULL,
  "avatar" TEXT NOT NULL,
  "portfolio" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Schedule" (
  "date" TEXT PRIMARY KEY,
  "status" "ScheduleStatus" NOT NULL DEFAULT 'OPEN',
  "startTime" TEXT NOT NULL DEFAULT '09:00',
  "endTime" TEXT NOT NULL DEFAULT '18:00',
  "slotDurationMins" INTEGER NOT NULL DEFAULT 30,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Session" (
  "date" TEXT PRIMARY KEY,
  "isClosed" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Booking" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "serviceName" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "notes" TEXT NOT NULL DEFAULT '',
  "status" "BookingStatus" NOT NULL DEFAULT 'BOOKED',
  "queuePosition" INTEGER NOT NULL DEFAULT 0,
  "isReserved" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "Booking_date_status_idx" ON "Booking"("date", "status");
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
