import { getMediaFiles } from "../actions";
import { MediaLibrary } from "./media-library";

export default async function MediaPage() {
  const { files, total } = await getMediaFiles({});

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Media Library</h1>
      <MediaLibrary files={files} total={total} />
    </div>
  );
}
