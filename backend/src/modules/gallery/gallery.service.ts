import { prisma } from '../../config';
import { NotFoundError } from '../../utils';
import { CreateGalleryItemInput, UpdateGalleryItemInput } from './gallery.validation';

export async function getAllItems(includeInactive = false) {
  const where = includeInactive ? {} : { isActive: true };
  return prisma.galleryItem.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function getItemsByCategory(category: string) {
  return prisma.galleryItem.findMany({
    where: { category, isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function getItemById(id: string) {
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) throw new NotFoundError('Gallery item not found');
  return item;
}

export async function createItem(data: CreateGalleryItemInput) {
  return prisma.galleryItem.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      imageUrl: data.imageUrl,
      category: data.category ?? 'Haircut',
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateItem(id: string, data: UpdateGalleryItemInput) {
  const existing = await prisma.galleryItem.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Gallery item not found');

  return prisma.galleryItem.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

export async function deleteItem(id: string) {
  const existing = await prisma.galleryItem.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Gallery item not found');
  await prisma.galleryItem.delete({ where: { id } });
}
