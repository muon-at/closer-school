import { useEffect, useState } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { getLeaderboard } from '../../lib/data';
import type { LeaderboardEntry } from '../../lib/types';

const medals = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    void getLeaderboard().then(setEntries);
  }, []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white sm:text-3xl">Leaderboard 🏆</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Poeng for godkjente AI-samtaler, scores og aktivitet i communityet.
          Nullstilles hver måned.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-center text-sm font-semibold text-amber-300">
        ⚡ Topp 3 denne måneden vinner 1:1-coaching med Sebastian
      </div>

      {/* Topp 3 */}
      <div className="grid gap-4 sm:grid-cols-3">
        {top3.map((e, i) => (
          <Card key={e.rank} accent="amber" className="text-center">
            <p className="text-4xl" aria-hidden>{medals[i]}</p>
            <p className="mt-2 text-lg font-black text-white">{e.name}</p>
            <p className="text-2xl font-black text-amber-400">{e.points} p</p>
            <p className="mt-1 text-xs text-zinc-400">
              {e.approvedCalls} godkjente samtaler · beste score {e.bestScore}
            </p>
            <Badge tone="amber" className="mt-3">Vinner 1:1 med Sebastian 🎯</Badge>
          </Card>
        ))}
      </div>

      {/* Resten */}
      <Card className="divide-y divide-white/10 p-0">
        {rest.map((e) => (
          <div
            key={e.rank}
            className={`flex items-center gap-4 px-5 py-3 ${e.isYou ? 'bg-amber-500/10' : ''}`}
          >
            <span className="w-8 text-sm font-bold text-zinc-400">#{e.rank}</span>
            <span className="flex-1 text-sm font-semibold text-white">
              {e.name} {e.isYou && <span className="text-amber-400">(deg)</span>}
            </span>
            <span className="hidden text-xs text-zinc-500 sm:block">
              {e.approvedCalls} samtaler · beste {e.bestScore}
            </span>
            <span className="text-sm font-bold text-white">{e.points} p</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
