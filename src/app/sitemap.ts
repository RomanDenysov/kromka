import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/features/posts/api/queries";
import { getProducts } from "@/features/products/api/queries";
import { getStores } from "@/features/stores/api/queries";
import { getSiteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: getSiteUrl(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: getSiteUrl("/e-shop"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: getSiteUrl("/predajne"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: getSiteUrl("/blog"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: getSiteUrl("/o-nas"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: getSiteUrl("/kontakt"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: getSiteUrl("/b2b"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: getSiteUrl("/obchodne-podmienky"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: getSiteUrl("/ochrana-osobnych-udajov"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: getSiteUrl("/pouzivanie-cookies"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic product pages
  const products = await getProducts();
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: getSiteUrl(`/product/${product.slug}`),
    lastModified: product.updatedAt ?? undefined,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic store pages
  const stores = await getStores();
  const storePages: MetadataRoute.Sitemap = stores.map((store) => ({
    url: getSiteUrl(`/predajne/${store.slug}`),
    lastModified: store.updatedAt ?? undefined,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Dynamic blog post pages
  const { posts: blogPosts } = await getPublishedPosts({ limit: 1000 });
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: getSiteUrl(`/blog/${post.slug}`),
    lastModified: post.updatedAt ?? post.publishedAt ?? undefined,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...storePages, ...blogPages];
}
