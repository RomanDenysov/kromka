import { Container } from '@/components/shared/container'
import { featureFlags } from '@/config/features'
import { homepageConfig } from '@/config/homepage'
import { GridCard, type GridCardSize, type GridItemConfig } from '@/widgets/grid-card'

// Define the entire homepage grid layout
const gridItems: GridItemConfig[] = [
  // Hero
  {
    id: 'hero-main',
    title: homepageConfig.hero.main.title || 'S láskou ku kvásku',
    subtitle: 'V Kromke to vonia čerstvým kváskovým chlebom',
    image: homepageConfig.hero.main.image,
    size: 'hero',
  },

  // CTA
  {
    id: 'hero-cta',
    title: homepageConfig.hero.cta.link?.label || 'Prejsť na eshop',
    subtitle: 'Objednajte si online a vyzdvihnite na predajni',
    href: homepageConfig.hero.cta.link?.href,
    image: homepageConfig.hero.cta.image,
    size: 'medium',
  },

  // Seasonal
  {
    id: 'seasonal',
    title: 'Medzi nami',
    subtitle: 'Za každú lakocinku si pripíšete vernostné body. Medzi nami sa to oplatí.',
    href: 'https://www.forms.vexioncards.one/signup/?id=6904a68be39f5e7c3da0b2cd&_cache_bust=1766948559772',
    image: '/images/banner_medzi_nami.webp',
    size: 'banner',
    externalLink: true,
  },

  {
    id: 'e-shop',
    title: 'Naše pečivo',
    subtitle: 'Čerstvé pečivo na každý deň',
    href: '/e-shop?category=nase-pecivo',
    images: ['/images/breads-3.jpg', '/images/breads-1.webp'],
    autoplayDelay: 5000,
    size: 'medium',
  },

  // B2B (with carousel)
  {
    id: 'b2b',
    requiresFlag: 'b2b',
    title: 'B2B Spolupráca',
    subtitle: 'Dodávame pre kaviarne a hotely',
    href: '/b2b',
    images: ['/images/b2b-1.webp', '/images/cooperation.jpg'],
    size: 'medium',
  },

  // Blog
  {
    id: 'blog',
    requiresFlag: 'blog',
    title: 'Magazín',
    subtitle: 'Recepty, tipy a novinky',
    href: '/blog',
    image: '/images/blog.jpg',
    size: 'medium',
  },

  // Stores
  {
    id: 'stores',
    requiresFlag: 'stores',
    title: 'Naše predajne',
    subtitle: 'Kde nás nájdete v Košiciach a Prešove',
    href: '/predajne',
    image: '/images/stores.webp',
    size: 'banner',
  },

  // E-shop

  {
    id: 'e-shop-meat',
    title: 'Maso a udeniny',
    subtitle: 'Kvalitné maso a udeniny pre váš stôl',
    href: '/e-shop?category=maso-a-udeniny',
    image: '/images/meat-trznica.jpg',
    size: 'medium',
  },

  // {
  //   id: "all-shops",
  //   title: "Naše predajne",
  //   subtitle: "Kde nás nájdete v Košiciach a Prešove",
  //   href: "/predajne",
  //   video: "/video/video-web-kromka.mp4",
  //   size: "banner",
  // },

  // Join Us
  // {
  //   id: "join-us",
  //   title: "Pridajte sa",
  //   subtitle: "Staňte sa súčasťou nášho tímu",
  //   href: "/kontakt",
  //   color: "bg-zinc-900",
  //   size: "small",
  //   textColor: "text-white",
  // },
]

// Filter items based on feature flags - happens on server
function getVisibleItems(): GridItemConfig[] {
  return gridItems.filter((item) => {
    if (item.requiresFlag) {
      return featureFlags[item.requiresFlag as keyof typeof featureFlags]
    }
    return true
  })
}

export function HomeGrid() {
  const visibleItems = getVisibleItems()

  const COLS = 6
  const sizeToSpan: Record<GridCardSize, number> = {
    banner: 6,
    hero: 4,
    large: 3,
    medium: 2,
    small: 1,
  }

  // Calculate remainder
  let usedInLastRow = 0
  for (const item of visibleItems) {
    const span = sizeToSpan[item.size || 'medium']
    usedInLastRow = (usedInLastRow + span) % COLS || COLS
  }
  const remainder = usedInLastRow === COLS ? 0 : COLS - usedInLastRow

  return (
    <section className="w-full pt-5 pb-6 md:pb-10">
      <Container>
        <div className="grid grid-cols-1 gap-4 md:grid-flow-dense md:grid-cols-4 lg:grid-cols-6">
          {visibleItems.map((item, index) => {
            const isLast = index === visibleItems.length - 1
            // If the last item and there is remainder, stretch it
            const extraSpan = isLast && remainder > 0 && remainder <= 2 ? remainder : 0

            return <GridCard key={item.id} {...item} extraSpan={extraSpan} preload={index < 6} />
          })}
        </div>
      </Container>
    </section>
  )
}
