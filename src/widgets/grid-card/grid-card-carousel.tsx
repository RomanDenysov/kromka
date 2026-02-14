'use client'

import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { type MouseEvent, useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { CardContent } from './card-content'
import { CardWrapper } from './card-wrapper'
import type { GridCardProps } from './types'
import { getCardSizeClasses, getExtraSpanClass, getImageSizes } from './utils'

type CarouselControlsProps = {
  images: string[]
  currentIndex: number
  onScrollTo: (index: number) => void
}

function CarouselControls({ images, currentIndex, onScrollTo }: CarouselControlsProps) {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: needed to capture click
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: needed to capture click
    <div
      className="absolute top-4 right-4 z-20 flex gap-1.5"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      {images.map((imgSrc, index) => (
        <button
          aria-label={`Go to slide ${index + 1}`}
          className={cn(
            'h-2 rounded-full transition-all',
            index === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/75',
          )}
          key={imgSrc}
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault()
            e.stopPropagation()
            onScrollTo(index)
          }}
          type="button"
        />
      ))}
    </div>
  )
}

type GridCardCarouselProps = Omit<GridCardProps, 'image'> & {
  images: string[]
  preload: boolean
  extraSpan?: number
}

export function GridCardCarousel({
  title,
  subtitle,
  href,
  images,
  size = 'medium',
  className,
  textColor,
  autoplay = true,
  autoplayDelay = 3000,
  preload = false,
  extraSpan = 0,
  externalLink = false,
}: GridCardCarouselProps) {
  const plugins = autoplay
    ? [
        Autoplay({
          delay: autoplayDelay,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ]
    : []

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 20 }, plugins)
  const [currentIndex, setCurrentIndex] = useState(0)

  const imageSizes = getImageSizes(size)

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return
    }
    setCurrentIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) {
      return
    }
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index)
    },
    [emblaApi],
  )

  return (
    <CardWrapper
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg transition-transform',
        getCardSizeClasses(size),
        getExtraSpanClass(size, extraSpan),
        className,
      )}
      external={externalLink}
      href={href}
    >
      {/* Carousel background */}
      <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((img, index) => (
            <div className="relative min-w-0 flex-[0_0_100%]" key={img}>
              <Image
                alt={`${title} - Slide ${index + 1}`}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                decoding="sync"
                fill
                loading={index === 0 && preload ? 'eager' : 'lazy'}
                sizes={imageSizes}
                src={img}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Carousel controls */}
      <CarouselControls currentIndex={currentIndex} images={images} onScrollTo={scrollTo} />

      {/* Content */}
      <CardContent
        hasImage
        href={href}
        size={size}
        subtitle={subtitle}
        textColor={textColor}
        title={title}
      />
    </CardWrapper>
  )
}
