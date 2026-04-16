import { type CSSProperties } from 'react'

interface SkeletonProps {
  className?: string
  style?: CSSProperties
  /** Visual radius preset — defaults to 'md' (12px) */
  radius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  /** Width — number for px, string for any CSS value */
  width?: number | string
  /** Height — number for px, string for any CSS value */
  height?: number | string
}

const RADIUS_MAP: Record<NonNullable<SkeletonProps['radius']>, string> = {
  sm: '6px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '28px',
  full: '9999px',
}

export function Skeleton({
  className = '',
  style,
  radius = 'md',
  width,
  height,
}: SkeletonProps) {
  const sizeStyle: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: RADIUS_MAP[radius],
  }

  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{ ...sizeStyle, ...style }}
      aria-hidden="true"
    />
  )
}
