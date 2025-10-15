export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      <div className="h-16 rounded-md bg-muted" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="h-48 lg:col-span-2 rounded-md bg-muted" />
        <div className="h-48 rounded-md bg-muted" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="h-64 lg:col-span-2 rounded-md bg-muted" />
        <div className="h-64 rounded-md bg-muted" />
      </div>
      <div className="h-56 rounded-md bg-muted" />
    </div>
  )
}
