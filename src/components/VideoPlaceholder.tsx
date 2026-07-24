// 16:9-plassholder for leksjonsvideoer. Manus er klart — video spilles inn
// før lansering (se docs/FORRETNINGSPLAN.md, seksjon 12).
export default function VideoPlaceholder({ title }: { title: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 text-2xl">
          ▶
        </div>
        <p className="font-semibold text-white">{title}</p>
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
          Video spilles inn — manus klart
        </span>
      </div>
    </div>
  );
}
