export default function SectionHeading({
  eyebrow,
  title,
  sub,
  center = false,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  center?: boolean;
}) {
  return (
    <div className={`mb-10 ${center ? 'text-center' : ''}`}>
      {eyebrow && (
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-amber-500">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {sub && <p className="mt-3 max-w-2xl text-zinc-400 md:text-lg">{sub}</p>}
    </div>
  );
}
