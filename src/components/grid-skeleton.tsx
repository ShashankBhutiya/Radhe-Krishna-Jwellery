export function GridSkeleton({ count = 9, cols = 3 }: { count?: number; cols?: 3 | 4 }) {
  return (
    <div
      className={
        'grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-7 md:grid-cols-3 ' +
        (cols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3')
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="skeleton aspect-[4/5] w-full" />
          <div className="skeleton mt-4 h-3 w-1/3" />
          <div className="skeleton mt-2 h-4 w-3/4" />
          <div className="skeleton mt-2 h-3 w-1/4" />
        </div>
      ))}
    </div>
  );
}
