// 16:9-plassholder for leksjonsvideoer. Manus er klart — video spilles inn
// før lansering (se docs/FORRETNINGSPLAN.md, seksjon 12).
import Icon from './Icon';

export default function VideoPlaceholder({ title }: { title: string }) {
  return (
    <div className="stripes-soft relative aspect-video w-full border border-dashed border-line bg-bone/5">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center border border-line bg-ink text-signal">
          <Icon name="play" size={22} />
        </span>
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.08em] text-bone">
          {title}
        </p>
        <span className="label-mono border border-signal px-2.5 py-1 text-signal">
          Video spilles inn — manus klart
        </span>
      </div>
      <span className="label-mono absolute bottom-2 right-3 text-[10px] text-bone/40">16/9</span>
    </div>
  );
}
