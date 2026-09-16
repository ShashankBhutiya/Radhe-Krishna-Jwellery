export default function Loading() {
  return (
    <div className="container-lux py-20">
      <div className="mx-auto max-w-md space-y-4 text-center">
        <div className="skeleton mx-auto h-3 w-24" />
        <div className="skeleton mx-auto h-9 w-72" />
        <div className="skeleton mx-auto h-3 w-56" />
      </div>
      <div className="mt-16 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-7 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/5] w-full" />
            <div className="skeleton mt-4 h-3 w-1/3" />
            <div className="skeleton mt-2 h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
