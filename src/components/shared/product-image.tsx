"use client";

import Image, { type ImageProps } from "next/image";

export function ProductImage({
  src,
  alt,
  width = 400,
  height = 400,
  priority = false,
  className,
}: ImageProps) {
  return (
    <Image
      alt={alt}
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAUABQDASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAQFBgP/xAAjEAACAQMEAgMBAAAAAAAAAAABAgMABBEFEiExE0EiUWFx/8QAFgEBAQEAAAAAAAAAAAAAAAAAAwAC/8QAGhEAAwEBAQEAAAAAAAAAAAAAAAECAxESMf/aAAwDAQACEQMRAD8A6XOuai+pTRwy7YkkKqF7ArLanfXF/OZbmTe+AOfQrQXujzNqz3UUPJO9lsf0K5XGiXK3olijMm7IXvmvTwXhlUb8/9k="
      className={className}
      decoding="sync"
      height={height}
      loading={priority ? "eager" : "lazy"}
      placeholder="blur"
      quality={75}
      src={src || "/images/sweat-bread.jpg"}
      width={width}
    />
  );
}
