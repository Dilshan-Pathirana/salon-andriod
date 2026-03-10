export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMins: number;
  isActive: boolean;
};

export type Appointment = {
  id: string;
  userId: string;
  date: string;
  timeSlot: string;
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  queuePosition: number;
};

export type Story = {
  id: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  caption: string;
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
};
