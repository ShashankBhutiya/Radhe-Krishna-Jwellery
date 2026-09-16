import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { AddressManager } from '@/components/address-manager';

export const dynamic = 'force-dynamic';

export default async function AddressesPage() {
  const session = await getSession();
  if (!session) return null;

  const addresses = await prisma.address.findMany({
    where: { userId: session.id },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  });

  return <AddressManager addresses={addresses} />;
}
