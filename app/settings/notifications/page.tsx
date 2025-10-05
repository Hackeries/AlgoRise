import { NotificationsToggle } from "@/components/pwa/notifications-toggle"

export default function NotificationsSettingsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-2 text-white/80 leading-relaxed">
        Control how AlgoRise notifies you about daily practice and contests.
      </p>
      <div className="mt-6">
        <NotificationsToggle />
      </div>
    </main>
  )
}
