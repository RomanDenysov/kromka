import type { Route } from 'next'

export type GridCardSize = 'small' | 'medium' | 'large' | 'hero' | 'banner'

export type GridCardProps = {
  preload: boolean
  title: string
  subtitle?: string
  href?: Route | null
  image?: string
  images?: string[]
  video?: string
  color?: string
  size?: GridCardSize
  className?: string
  textColor?: string
  autoplay?: boolean
  autoplayDelay?: number
  extraSpan?: number
  externalLink?: boolean
}

export type GridItemConfig = Omit<GridCardProps, 'preload'> & {
  id: string
  requiresFlag?: string
}
