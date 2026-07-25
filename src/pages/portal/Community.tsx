import { useEffect, useState } from 'react';
import Icon, { type IconName } from '../../components/Icon';
import MediaPlaceholder from '../../components/MediaPlaceholder';
import PageHeader from '../../components/PageHeader';
import { getPosts } from '../../lib/data';
import type { Post } from '../../lib/types';

const typeTag: Record<Post['type'], { label: string; cls: string }> = {
  win: { label: 'WIN', cls: 'border-win text-win' },
  tips: { label: 'TIPS', cls: 'border-signal text-signal' },
  sporsmal: { label: 'SPØRSMÅL', cls: 'border-line text-bone/60' },
};

const reactionIcons: { key: keyof Post['reactions']; icon: IconName }[] = [
  { key: 'fire', icon: 'flame' },
  { key: 'clap', icon: 'star' },
  { key: 'money', icon: 'trophy' },
];

const weekRhythm = [
  { day: 'MAN', text: 'Ukens closing-tips slippes' },
  { day: 'ONS', text: 'Del ukas seier i feeden' },
  { day: 'TOR', text: 'Live call review med Sebastian' },
];

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<'alle' | Post['type']>('alle');

  useEffect(() => {
    void getPosts().then(setPosts);
  }, []);

  const filtered = filter === 'alle' ? posts : posts.filter((p) => p.type === filter);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Community"
        title="Closerskolen Inside"
        sub="Wins, tips og spørsmål — fra folk som står i akkurat det samme som deg."
        right={
          <p className="font-mono text-sm font-semibold text-bone">
            {posts.length}{' '}
            <span className="label-mono text-bone/40">poster</span>
          </p>
        }
      />

      {/* Wins Wednesday — smal signal-stripe */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 bg-signal px-4 py-2.5 text-ink">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.15em]">
          Wins Wednesday
        </span>
        <span className="font-mono text-xs">
          I dag deler alle ukas seier — stor eller liten. Post den!
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Hovedfeed */}
        <div className="lg:col-span-2">
          {/* Filter */}
          <div className="flex flex-wrap gap-2 border-b border-line pb-4">
            {(['alle', 'win', 'tips', 'sporsmal'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`label-mono border px-3 py-1.5 transition-colors ${
                  filter === f
                    ? 'border-signal bg-signal/10 text-signal'
                    : 'border-line text-bone/50 hover:border-bone/40 hover:text-bone'
                }`}
              >
                {f === 'alle' ? 'Alle' : f === 'win' ? 'Wins' : f === 'tips' ? 'Tips' : 'Spørsmål'}
              </button>
            ))}
          </div>

          {/* Poster som rader */}
          <div>
            {filtered.map((p) => (
              <article key={p.id} className="border-b border-line py-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`label-mono shrink-0 border px-2 py-0.5 ${typeTag[p.type].cls}`}
                  >
                    {typeTag[p.type].label}
                  </span>
                  <span className="label-mono text-bone/40">
                    {p.author} · {p.date}
                  </span>
                </div>
                <h2 className="mt-3 font-semibold leading-snug text-bone">{p.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-bone/60">{p.body}</p>
                <div className="mt-4 flex gap-2">
                  {reactionIcons.map(({ key, icon }) => (
                    <button
                      key={key}
                      className="label-mono flex items-center gap-1.5 border border-line px-2.5 py-1 text-bone/60 transition-colors hover:border-signal hover:text-signal"
                    >
                      <Icon name={icon} size={12} />
                      {p.reactions[key]}
                    </button>
                  ))}
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <p className="label-mono py-6 text-bone/40">Ingen poster i dette filteret.</p>
            )}
          </div>
        </div>

        {/* Høyre kolonne */}
        <aside className="space-y-6">
          <div className="border border-line">
            <div className="border-b border-line p-4">
              <p className="label-mono text-signal">— Ukens closing-tips</p>
              <p className="mt-2 font-display text-sm uppercase tracking-tight text-bone">
                «Stillheten etter pris» — 4 min
              </p>
            </div>
            <div className="p-4">
              <MediaPlaceholder
                kind="video"
                ratio="16/9"
                size="sm"
                label="Ukens tips — Sebastian"
              />
              <p className="mt-3 text-xs leading-relaxed text-bone/60">
                Hvorfor den som snakker først etter prisen taper — og hvordan du
                trener deg til å tåle stillheten.
              </p>
            </div>
          </div>

          <div className="border border-line p-4">
            <p className="label-mono text-bone/50">— Ukesrytmen</p>
            <ul className="mt-3">
              {weekRhythm.map((r) => (
                <li
                  key={r.day}
                  className="flex items-baseline gap-3 border-b border-line py-2.5 last:border-0"
                >
                  <span className="label-mono w-10 shrink-0 text-signal">{r.day}</span>
                  <span className="font-mono text-xs text-bone/70">{r.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
