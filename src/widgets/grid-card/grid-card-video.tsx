'use client'

import { Pause, Play } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { CardContent } from './card-content'
import { CardWrapper } from './card-wrapper'
import type { GridCardProps } from './types'
import { getCardSizeClasses, getExtraSpanClass } from './utils'

type GridCardVideoProps = Omit<GridCardProps, 'images' | 'image'> & {
  video: string
  poster?: string
}

export function GridCardVideo({
  title,
  subtitle,
  href,
  video,
  poster,
  size = 'medium',
  className,
  textColor,
  preload = false,
  extraSpan = 0,
  externalLink = false,
}: GridCardVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const userPausedRef = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isInView, setIsInView] = useState(false)

  // Intersection Observer - play when in view
  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
        // Reset user pause when scrolled out of view
        if (!entry.isIntersecting) {
          userPausedRef.current = false
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Auto-play/pause based on visibility
  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl) {
      return
    }

    if (isInView && !isPlaying && !userPausedRef.current) {
      videoEl
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay may be blocked by browser
        })
    } else if (!isInView && isPlaying) {
      videoEl.pause()
      setIsPlaying(false)
    }
  }, [isInView, isPlaying])

  const togglePlay = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const videoEl = videoRef.current
      if (!videoEl) {
        return
      }

      if (isPlaying) {
        videoEl.pause()
        setIsPlaying(false)
        userPausedRef.current = true
      } else {
        userPausedRef.current = false
        videoEl
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Play may be blocked by browser
          })
      }
    },
    [isPlaying],
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
      <div className="absolute inset-0" ref={containerRef}>
        <video
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
          poster={poster}
          preload={preload ? 'auto' : 'metadata'}
          ref={videoRef}
        >
          <source src={video} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Play/Pause button - wrapper prevents Link navigation */}
      <div
        className="absolute top-4 right-4 z-20"
        onClickCapture={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <button
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          onClick={togglePlay}
          type="button"
        >
          {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 translate-x-0.5" />}
        </button>
      </div>

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
