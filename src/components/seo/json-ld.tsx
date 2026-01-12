import type { Thing, WithContext } from "schema-dts";

type JsonLdProps = {
  data: WithContext<Thing> | WithContext<Thing>[];
};

/**
 * Server component for rendering JSON-LD structured data.
 * Uses dangerouslySetInnerHTML which is safe here because:
 * - Data comes from our own schema builders (not user input)
 * - JSON.stringify ensures proper escaping
 * - This is the standard Next.js approach for JSON-LD
 */
export function JsonLd({ data }: JsonLdProps) {
  const jsonLdData = Array.isArray(data) ? data : [data];

  return (
    <>
      {jsonLdData.map((schema, index) => (
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
          key={`json-ld-${index}`}
          type="application/ld+json"
        />
      ))}
    </>
  );
}
