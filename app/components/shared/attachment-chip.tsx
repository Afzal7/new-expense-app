import { FileText } from "lucide-react";

interface AttachmentChipProps {
  url: string;
  type?: string; // Optional, for future extension
}

export const AttachmentChip = ({ url, type }: AttachmentChipProps) => {
  // Mock logic: if it looks like an image URL, show preview, else show icon
  const isImage =
    url.includes("unsplash") ||
    url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ||
    type?.startsWith("image/");

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center justify-center w-12 h-12 rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden hover:border-[#FF8A65] hover:shadow-sm transition-all active:scale-95"
    >
      {isImage ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity"
            style={{ backgroundImage: `url(${url})` }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        </>
      ) : (
        <FileText className="w-5 h-5 text-zinc-400 group-hover:text-[#FF8A65]" />
      )}
    </a>
  );
};
