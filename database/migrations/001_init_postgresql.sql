CREATE TYPE user_role AS ENUM ('ADMIN', 'CLIENT');
CREATE TYPE booking_status AS ENUM ('BOOKED', 'IN_SERVICE', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE schedule_status AS ENUM ('OPEN', 'CLOSED', 'HOLIDAY');
CREATE TYPE service_category AS ENUM ('HAIRCUT', 'BEARD', 'COMBO', 'PREMIUM');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(16) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  role user_role NOT NULL DEFAULT 'CLIENT',
  profile_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash CHAR(64) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  icon VARCHAR(80) NOT NULL,
  category service_category NOT NULL DEFAULT 'HAIRCUT',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  title VARCHAR(120) NOT NULL,
  experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
  avatar TEXT NOT NULL,
  portfolio JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE schedules (
  date DATE PRIMARY KEY,
  status schedule_status NOT NULL DEFAULT 'OPEN',
  start_time TIME NOT NULL DEFAULT '09:00',
  end_time TIME NOT NULL DEFAULT '18:00',
  slot_duration_mins INTEGER NOT NULL DEFAULT 30 CHECK (slot_duration_mins > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
  date DATE PRIMARY KEY,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  service_name VARCHAR(120) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  status booking_status NOT NULL DEFAULT 'BOOKED',
  queue_position INTEGER NOT NULL DEFAULT 0,
  is_reserved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_date_status ON bookings(date, status);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE UNIQUE INDEX uq_booking_slot_active ON bookings(date, time)
WHERE status IN ('BOOKED', 'IN_SERVICE');
