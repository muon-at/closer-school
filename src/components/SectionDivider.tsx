// «Kapittelmarkør» i Salgsgulvet-stil — à la filmklapper.
// Full-bredde skille som ÅPNER hver hovedseksjon: 4px signal-topplinje,
// stor seksjonsindeks i mono (S.01, S.02 …) og seksjonens navn i label-mono.
// Brukes konsistent på alle seksjoner på landingssiden + øverst på
// undersider (Garanti, Vilkår, Påmelding) slik at seksjonene alltid er
// tydelig adskilt — uansett bakgrunnsfarge.

export default function SectionDivider({
  index,
  name,
  tone = 'ink',
}: {
  /** Seksjonsnummer — rendres som S.01, S.02 … */
  index: number;
  /** Seksjonens navn — settes i label-mono */
  name: string;
  /** 'ink' på mørke seksjoner, 'bone' på lyse seksjoner */
  tone?: 'ink' | 'bone';
}) {
  const onBone = tone === 'bone';
  return (
    <div className="border-t-4 border-signal" aria-hidden>
      <div className="mx-auto flex max-w-6xl items-baseline gap-4 px-4 pt-5">
        <span
          className={`font-mono text-2xl font-semibold leading-none tracking-tight sm:text-3xl ${
            onBone ? 'text-ink' : 'text-bone'
          }`}
        >
          S.{String(index).padStart(2, '0')}
        </span>
        <span className="label-mono text-signal">{name}</span>
        <span
          className={`h-px flex-1 self-center ${onBone ? 'bg-line-ink' : 'bg-line'}`}
        />
      </div>
    </div>
  );
}

// Tynn «spacer-stripe» (8px) med diagonalt stripemønster — legges MELLOM to
// mørke naboseksjoner der bakgrunnen ikke veksler, så skillet likevel synes.
export function StripeSpacer() {
  return <div className="stripes-soft h-2 w-full bg-bone/10" aria-hidden />;
}
