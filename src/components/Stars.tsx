interface StarsProps {
  rating: number
  size?: 'sm' | 'lg'
  onRate?: (rating: number) => void
}

export default function Stars({ rating, size = 'sm', onRate }: StarsProps) {
  const cls = size === 'lg' ? 'text-3xl' : 'text-base'
  return (
    <span className={`${cls} leading-none`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          role={onRate ? 'button' : undefined}
          onClick={onRate ? () => onRate(i) : undefined}
          className={`${i <= rating ? 'text-yellow-400' : 'text-gray-600'} ${onRate ? 'cursor-pointer' : ''}`}
        >
          ★
        </span>
      ))}
    </span>
  )
}
