export default function SectionHeading({
  eyebrow,
  title,
  sub,
  center = false,
  tone = 'ink',
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  center?: boolean;
  /** 'ink' på mørke seksjoner, 'bone' på lyse seksjoner */
  tone?: 'ink' | 'bone';
}) {
  const onBone = tone === 'bone';
  return (
    <div className={`mb-12 ${center ? 'text-center' : ''}`}>
      {eyebrow && <p className="label-mono mb-3 text-signal">— {eyebrow}</p>}
      <h2
        className={`font-display text-3xl uppercase leading-[0.95] tracking-tight sm:text-5xl ${
          onBone ? 'text-ink' : 'text-bone'
        }`}
      >
        {title}
      </h2>
      {sub && (
        <p
          className={`mt-4 max-w-2xl text-base leading-relaxed md:text-lg ${
            onBone ? 'text-ink/70' : 'text-bone/60'
          } ${center ? 'mx-auto' : ''}`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
