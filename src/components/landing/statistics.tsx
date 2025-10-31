import { Container } from "../shared/container";

type Stat = {
  label: string;
  value: string;
  suffix?: string;
};

const stats: Stat[] = [
  {
    label: "Upečených chlebov mesačne",
    value: "12,000",
    suffix: "+",
  },
  {
    label: "Spokojných zákazníkov",
    value: "5,000",
    suffix: "+",
  },
  {
    label: "Návštev e-shopu mesačne",
    value: "25,000",
    suffix: "+",
  },
  {
    label: "Rokov na trhu",
    value: "8",
  },
];

export function Statistics() {
  // TODO: Replace with real data from database/analytics

  return (
    <section className="w-full">
      <Container className="py-16 md:py-24">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              className="flex flex-col items-center text-center"
              key={stat.label}
            >
              <div className="font-medium text-4xl tracking-tight">
                {stat.value}
                {stat.suffix && (
                  <span className="text-primary">{stat.suffix}</span>
                )}
              </div>
              <div className="mt-2 text-muted-foreground text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
