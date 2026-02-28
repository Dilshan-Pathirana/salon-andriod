import { Response, NextFunction } from 'express';
import * as appointmentsService from './appointments.service';
import { sendSuccess } from '../../utils';
import { AuthenticatedRequest } from '../../types';
import { AppointmentStatus } from '@prisma/client';

export async function createAppointment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new Error('Auth required');
    const appointment = await appointmentsService.createAppointment(
      req.user.userId,
      req.body
    );
    sendSuccess(res, appointment, 'Appointment booked successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getAppointments(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { date, status, userId } = req.query as {
      date?: string;
      status?: AppointmentStatus;
      userId?: string;
    };
    const appointments = await appointmentsService.getAppointments({ date, status, userId });
    sendSuccess(res, appointments, 'Appointments retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getAppointmentById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const appointment = await appointmentsService.getAppointmentById(req.params.id);
    sendSuccess(res, appointment, 'Appointment retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getMyAppointments(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new Error('Auth required');
    const appointments = await appointmentsService.getUserAppointments(req.user.userId);
    sendSuccess(res, appointments, 'Your appointments retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateAppointment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const appointment = await appointmentsService.updateAppointment(req.params.id, req.body);
    sendSuccess(res, appointment, 'Appointment updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function cancelAppointment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new Error('Auth required');
    const isAdmin = req.user.role === 'ADMIN';
    const appointment = await appointmentsService.cancelAppointment(
      req.params.id,
      req.user.userId,
      isAdmin
    );
    sendSuccess(res, appointment, 'Appointment cancelled successfully');
  } catch (error) {
    next(error);
  }
}

export async function completeAppointment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const appointment = await appointmentsService.completeAppointment(req.params.id);
    sendSuccess(res, appointment, 'Appointment marked as completed');
  } catch (error) {
    next(error);
  }
}

export async function markInService(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const appointment = await appointmentsService.markInService(req.params.id);
    sendSuccess(res, appointment, 'Appointment marked as in service');
  } catch (error) {
    next(error);
  }
}

export async function markNoShow(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const appointment = await appointmentsService.markNoShow(req.params.id);
    sendSuccess(res, appointment, 'Appointment marked as no-show');
  } catch (error) {
    next(error);
  }
}

export async function deleteAppointment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await appointmentsService.deleteAppointment(req.params.id);
    sendSuccess(res, null, 'Appointment deleted successfully');
  } catch (error) {
    next(error);
  }
}
