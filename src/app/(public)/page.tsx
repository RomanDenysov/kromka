import { CallToAction } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { Statistics } from "@/components/landing/statistics";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Statistics />
      <CallToAction />
    </>
  );
}
