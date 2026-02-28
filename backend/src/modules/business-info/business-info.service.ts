import { prisma } from '../../config';
import { UpsertBusinessInfoInput, BulkUpsertInput } from './business-info.validation';

export async function getAll() {
  return prisma.businessInfo.findMany({
    orderBy: [{ category: 'asc' }, { key: 'asc' }],
  });
}

export async function getByCategory(category: string) {
  return prisma.businessInfo.findMany({
    where: { category },
    orderBy: { key: 'asc' },
  });
}

export async function getByKey(key: string) {
  return prisma.businessInfo.findUnique({ where: { key } });
}

export async function upsert(data: UpsertBusinessInfoInput) {
  return prisma.businessInfo.upsert({
    where: { key: data.key },
    update: { value: data.value, category: data.category },
    create: { key: data.key, value: data.value, category: data.category },
  });
}

export async function bulkUpsert(data: BulkUpsertInput) {
  const results = await Promise.all(
    data.items.map((item) =>
      prisma.businessInfo.upsert({
        where: { key: item.key },
        update: { value: item.value, category: item.category },
        create: { key: item.key, value: item.value, category: item.category },
      })
    )
  );
  return results;
}

export async function remove(key: string) {
  const existing = await prisma.businessInfo.findUnique({ where: { key } });
  if (!existing) return;
  await prisma.businessInfo.delete({ where: { key } });
}
