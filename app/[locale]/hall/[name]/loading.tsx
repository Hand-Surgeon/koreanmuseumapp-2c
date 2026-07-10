export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-8" aria-hidden="true">
      <div className="mb-6 h-10 w-48 rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-64 rounded-2xl bg-gray-200" />
        ))}
      </div>
    </div>
  )
}
