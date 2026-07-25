// Plassholder for bilder/video som skal produseres før lansering.
// Viser tydelig i mono hva som skal inn, slik at innholdsproduksjonen
// kan gjøres 1:1 mot designet.
import Icon from './Icon';

type Ratio = '16/9' | '4/5' | '1/1' | '3/4';

const ratioCls: Record<Ratio, string> = {
  '16/9': 'aspect-video',
  '4/5': 'aspect-[4/5]',
  '1/1': 'aspect-square',
  '3/4': 'aspect-[3/4]',
};

export default function MediaPlaceholder({
  kind,
  label,
  ratio = '16/9',
  size,
  tone = 'ink',
  className = '',
}: {
  kind: 'image' | 'video';
  label: string;
  ratio?: Ratio;
  size?: 'sm' | 'md';
  /** 'ink' på mørke seksjoner, 'bone' på lyse seksjoner */
  tone?: 'ink' | 'bone';
  className?: string;
}) {
  const isVideo = kind === 'video';
  const onBone = tone === 'bone';
  return (
    <div
      className={`stripes-soft relative w-full border border-dashed ${
        onBone ? 'border-line-ink bg-ink/5' : 'border-line bg-bone/5'
      } ${ratioCls[ratio]} ${className}`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
        <span
          className={`flex h-12 w-12 items-center justify-center border text-signal ${
            onBone ? 'border-line-ink bg-bone' : 'border-line bg-ink'
          }`}
        >
          <Icon name={isVideo ? 'play' : 'camera'} size={size === 'sm' ? 16 : 20} />
        </span>
        <p
          className={`label-mono max-w-[90%] ${onBone ? 'text-ink/70' : 'text-bone/70'} ${
            size === 'sm' ? 'text-[10px]' : ''
          }`}
        >
          {isVideo ? 'VIDEO' : 'BILDE'}: {label}
        </p>
      </div>
      <span
        className={`label-mono absolute bottom-2 right-3 text-[10px] ${
          onBone ? 'text-ink/40' : 'text-bone/40'
        }`}
      >
        {ratio}
      </span>
    </div>
  );
}
