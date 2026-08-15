interface StarsProps {
  rating: number
  size?: 'sm' | 'lg'
  onRate?: (rating: number) => void
}

function Star({ fill, size, onRate, index }: { fill: number; size: 'sm' | 'lg'; onRate?: (r: number) => void; index: number }) {
  const px = size === 'lg' ? 'text-3xl' : 'text-base'
  return (
    <span className={`relative inline-block ${px} leading-none`}>
      <span className="text-gray-600">★</span>
      <span
        className="absolute inset-0 overflow-hidden text-yellow-400"
        style={{ width: `${Math.max(0, Math.min(1, fill)) * 100}%` }}
      >
        ★
      </span>
      {onRate && (
        <>
          <span
            role="button"
            aria-label={`Rate ${index + 0.5} stars`}
            className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
            onClick={() => onRate(index + 0.5)}
          />
          <span
            role="button"
            aria-label={`Rate ${index + 1} stars`}
            className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
            onClick={() => onRate(index + 1)}
          />
        </>
      )}
    </span>
  )
}

export default function Stars({ rating, size = 'sm', onRate }: StarsProps) {
  return (
    <span className="inline-flex">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} index={i} fill={rating - i} size={size} onRate={onRate} />
      ))}
    </span>
  )
}
