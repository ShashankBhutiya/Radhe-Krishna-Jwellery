import { prisma } from '@/lib/prisma';
import { MessageList } from '@/components/admin/message-list';

export const dynamic = 'force-dynamic';

export default async function AdminMessages() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <h1 className="display-md">Messages</h1>
      <p className="mt-2 text-[14px] text-ink-2">
        {messages.filter((m) => !m.isRead).length} unread of {messages.length}.
      </p>
      <MessageList
        messages={messages.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          phone: m.phone,
          subject: m.subject,
          message: m.message,
          isRead: m.isRead,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
