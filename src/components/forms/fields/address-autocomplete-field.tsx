"use client";

import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useRef, useState } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { env } from "@/env";
import { cn } from "@/lib/utils";

const libraries: "places"[] = ["places"];

const AUTOCOMPLETE_OPTIONS = {
  componentRestrictions: { country: "sk" },
  fields: [
    "address_components",
    "geometry",
    "place_id",
    "formatted_address",
  ],
  types: ["address"],
} as const;

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  description?: string;
  className?: string;
  baseFieldName?: string; // Base field name for nested address object (default: "address")
};

function getAddressComponent(
  components: google.maps.GeocoderAddressComponent[] | undefined,
  type: string
): string {
  if (!components) {
    return "";
  }
  const component = components.find((c) => c.types.includes(type));
  return component?.long_name ?? "";
}

export function AddressAutocompleteField<T extends FieldValues>({
  name,
  label,
  description,
  className,
  baseFieldName = "address",
}: Props<T>) {
  const { setValue, getValues } = useFormContext();
  const [inputValue, setInputValue] = useState(() => {
    const address = getValues(baseFieldName as FieldPath<T>);
    if (
      address &&
      typeof address === "object" &&
      "street" in address &&
      "city" in address
    ) {
      const addr = address as { street?: string; city?: string };
      if (addr.street && addr.city) {
        return `${addr.street}, ${addr.city}`;
      }
    }
    return "";
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
    libraries,
  });

  const onLoad = useCallback(
    (autocomplete: google.maps.places.Autocomplete) => {
      autocompleteRef.current = autocomplete;
    },
    []
  );

  const onPlaceChanged = useCallback(() => {
    const autocomplete = autocompleteRef.current;
    if (!autocomplete) {
      return;
    }

    const place = autocomplete.getPlace();
    if (!place?.address_components) {
      return;
    }

    const streetNumber = getAddressComponent(
      place.address_components,
      "street_number"
    );
    const route = getAddressComponent(place.address_components, "route");
    const street = streetNumber ? `${route} ${streetNumber}` : route;

    const city =
      getAddressComponent(place.address_components, "locality") ||
      getAddressComponent(
        place.address_components,
        "administrative_area_level_2"
      );

    const postalCode = getAddressComponent(
      place.address_components,
      "postal_code"
    );

    const country = getAddressComponent(place.address_components, "country");

    // biome-ignore lint/suspicious/noExplicitAny: react-hook-form FieldPath type doesn't support dynamic nested paths
    setValue(`${baseFieldName}.street` as any, street, {
      shouldDirty: true,
    });
    // biome-ignore lint/suspicious/noExplicitAny: react-hook-form FieldPath type doesn't support dynamic nested paths
    setValue(`${baseFieldName}.city` as any, city, {
      shouldDirty: true,
    });
    // biome-ignore lint/suspicious/noExplicitAny: react-hook-form FieldPath type doesn't support dynamic nested paths
    setValue(`${baseFieldName}.postalCode` as any, postalCode, {
      shouldDirty: true,
    });
    // biome-ignore lint/suspicious/noExplicitAny: react-hook-form FieldPath type doesn't support dynamic nested paths
    setValue(`${baseFieldName}.country` as any, country, {
      shouldDirty: true,
    });
    // biome-ignore lint/suspicious/noExplicitAny: react-hook-form FieldPath type doesn't support dynamic nested paths
    setValue(`${baseFieldName}.googleId` as any, place.place_id ?? "", {
      shouldDirty: true,
    });

    if (place.geometry?.location) {
      setValue("latitude", place.geometry.location.lat().toString(), {
        shouldDirty: true,
      });
      setValue("longitude", place.geometry.location.lng().toString(), {
        shouldDirty: true,
      });
    }

    setInputValue(place.formatted_address ?? "");
  }, [baseFieldName, setValue]);

  if (!isLoaded) {
    return (
      <Field className={cn("gap-1", className)}>
        <FieldLabel>{label}</FieldLabel>
        <Skeleton className="h-8 max-w-xs" />
        {description && (
          <FieldDescription className="text-muted-foreground text-xs">
            {description}
          </FieldDescription>
        )}
      </Field>
    );
  }

  return (
    <Field className={cn("gap-1", className)}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
        options={AUTOCOMPLETE_OPTIONS}
      >
        <Input
          className="max-w-xs"
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Zadajte adresu..."
          value={inputValue}
          volume="xs"
        />
      </Autocomplete>
      {description && (
        <FieldDescription className="text-muted-foreground text-xs">
          {description}
        </FieldDescription>
      )}
    </Field>
  );
}
