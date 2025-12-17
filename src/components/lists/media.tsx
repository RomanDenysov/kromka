import Image from "next/image";
import { getMedia } from "@/lib/queries/media";

export async function MediaList() {
  const media = await getMedia();
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
      {media.map((item) => (
        <div
          className="relative aspect-square overflow-hidden rounded-md bg-muted"
          key={item.id}
        >
          <Image
            alt={item.name}
            className="aspect-square size-full object-cover"
            height={160}
            src={item.url}
            width={160}
          />
        </div>
      ))}
    </div>
  );
}
