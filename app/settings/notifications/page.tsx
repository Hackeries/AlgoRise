import { NotificationsToggle } from '@/components/pwa/notifications-toggle';

export default function NotificationsSettingsPage() {
  return (
    <main className='mx-auto max-w-3xl px-4 sm:px-6 py-10'>
      {/* Page Header */}
      <header className='mb-8'>
        <h1 className='text-3xl sm:text-4xl font-bold tracking-tight'>
          Notification Settings
        </h1>
        <p className='mt-2 text-muted-foreground sm:text-lg'>
          Control how AlgoRise notifies you about daily practice, contests, and
          updates.
        </p>
      </header>

      {/* Notifications Toggle Section */}
      <section className='space-y-6'>
        <NotificationsToggle />
      </section>
    </main>
  );
}
