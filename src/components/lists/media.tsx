import Image from "next/image";
import { getMedia } from "@/lib/queries/media";
import { AspectRatio } from "../ui/aspect-ratio";

export async function MediaList() {
  const media = await getMedia();
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
      {media.map((item) => (
        <div
          className="relative aspect-square overflow-hidden rounded-md bg-muted"
          key={item.id}
        >
          <AspectRatio ratio={1}>
            <Image alt={item.name} height={160} src={item.url} width={160} />
          </AspectRatio>
        </div>
      ))}
    </div>
  );
}
