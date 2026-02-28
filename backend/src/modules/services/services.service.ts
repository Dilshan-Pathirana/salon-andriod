import { ServiceCategory } from '@prisma/client';
import { prisma } from '../../config';
import { NotFoundError } from '../../utils';
import { CreateServiceInput, UpdateServiceInput } from './services.validation';

export async function getAllServices(includeInactive = false) {
  const where = includeInactive ? {} : { isActive: true };
  return prisma.service.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
}

export async function getServicesByCategory(category: ServiceCategory) {
  return prisma.service.findMany({
    where: { category, isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
}

export async function getServiceById(id: string) {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) throw new NotFoundError('Service not found');
  return service;
}

export async function createService(data: CreateServiceInput) {
  return prisma.service.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      duration: data.duration,
      price: data.price,
      category: data.category as ServiceCategory,
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

export async function updateService(id: string, data: UpdateServiceInput) {
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Service not found');

  return prisma.service.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.duration !== undefined && { duration: data.duration }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.category !== undefined && { category: data.category as ServiceCategory }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
  });
}

export async function deleteService(id: string) {
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Service not found');
  await prisma.service.delete({ where: { id } });
}
