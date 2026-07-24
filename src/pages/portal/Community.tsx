import { useEffect, useState } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { getPosts } from '../../lib/data';
import type { Post } from '../../lib/types';

const typeBadge: Record<Post['type'], { label: string; tone: 'green' | 'amber' | 'zinc' }> = {
  win: { label: '🏆 Win', tone: 'green' },
  tips: { label: '💡 Tips', tone: 'amber' },
  sporsmal: { label: '❓ Spørsmål', tone: 'zinc' },
};

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<'alle' | Post['type']>('alle');

  useEffect(() => {
    void getPosts().then(setPosts);
  }, []);

  const filtered = filter === 'alle' ? posts : posts.filter((p) => p.type === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white sm:text-3xl">Closerskolen Inside 💬</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Wins, tips og spørsmål — fra folk som står i akkurat det samme som deg.
        </p>
      </div>

      {/* Wins Wednesday-banner */}
      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-black text-white">🏆 WINS WEDNESDAY</p>
            <p className="text-sm text-zinc-300">
              I dag deler alle ukas seier — stor eller liten. Første salg? Beste
              AI-score? Post den!
            </p>
          </div>
          <Badge tone="green">Hver onsdag</Badge>
        </div>
      </div>

      {/* Ukens closing-tips videokort */}
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/5 sm:w-56">
          <span className="text-3xl" aria-hidden>▶</span>
        </div>
        <div className="flex-1">
          <Badge tone="amber">🎬 Ukens closing-tips · mandag</Badge>
          <h2 className="mt-2 font-bold text-white">
            «Stillheten etter pris» — 4 min med Sebastian
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Hvorfor den som snakker først etter prisen taper — og hvordan du
            trener deg til å tåle stillheten. (Video spilles inn — manus klart.)
          </p>
        </div>
      </Card>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {(['alle', 'win', 'tips', 'sporsmal'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              filter === f
                ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                : 'border-white/15 text-zinc-400 hover:text-white'
            }`}
          >
            {f === 'alle' ? 'Alle' : f === 'win' ? 'Wins' : f === 'tips' ? 'Tips' : 'Spørsmål'}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {filtered.map((p) => (
          <Card key={p.id}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15 text-sm font-bold text-amber-400">
                {p.author[0]}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{p.author}</p>
                <p className="text-xs text-zinc-500">{p.date}</p>
              </div>
              <Badge tone={typeBadge[p.type].tone}>{typeBadge[p.type].label}</Badge>
            </div>
            <h2 className="mt-3 font-bold text-white">{p.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-zinc-300">{p.body}</p>
            <div className="mt-4 flex gap-2 border-t border-white/10 pt-3">
              <button className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:border-amber-500/40">
                🔥 {p.reactions.fire}
              </button>
              <button className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:border-amber-500/40">
                👏 {p.reactions.clap}
              </button>
              <button className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:border-amber-500/40">
                💰 {p.reactions.money}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
