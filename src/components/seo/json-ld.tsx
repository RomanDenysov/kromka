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
function getSchemaType(schema: WithContext<Thing>): string {
  // Cast to access @type property which may not be in the WithContext type
  const schemaWithType = schema as { "@type"?: string | string[] };
  const type = schemaWithType["@type"];
  if (typeof type === "string") {
    return type;
  }
  if (Array.isArray(type) && type.length > 0) {
    return String(type[0]);
  }
  return "unknown";
}

export function JsonLd({ data }: JsonLdProps) {
  const jsonLdData = Array.isArray(data) ? data : [data];

  return (
    <>
      {jsonLdData.map((schema, index) => {
        const schemaType = getSchemaType(schema);
        const key = `json-ld-${schemaType}-${index}`;

        return (
          <script
            // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires innerHTML, data is from our schema builders
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(schema),
            }}
            key={key}
            type="application/ld+json"
          />
        );
      })}
    </>
  );
}
