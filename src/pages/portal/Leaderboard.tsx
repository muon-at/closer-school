import { useEffect, useState } from 'react';
import MediaPlaceholder from '../../components/MediaPlaceholder';
import PageHeader from '../../components/PageHeader';
import { getLeaderboard } from '../../lib/data';
import type { LeaderboardEntry } from '../../lib/types';

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    void getLeaderboard().then(setEntries);
  }, []);

  const top1 = entries[0];
  const top23 = entries.slice(1, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Leaderboard"
        title="Scoreboardet"
        sub="Poeng for godkjente AI-samtaler, scores og aktivitet i communityet. Nullstilles hver måned."
        right={
          <p className="label-mono text-signal">
            Topp 3 vinner 1:1 med Sebastian
          </p>
        }
      />

      {/* Pallen */}
      {top1 && (
        <div className="border border-signal bg-signal/5 p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-5">
              <span className="font-display text-5xl leading-none tracking-tight text-signal sm:text-7xl">
                01
              </span>
              <div className="w-20 shrink-0 sm:w-24">
                <MediaPlaceholder kind="image" ratio="1/1" size="sm" label="Profilbilde" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl uppercase tracking-tight text-bone sm:text-2xl">
                {top1.name}
              </p>
              <p className="label-mono mt-1.5 text-bone/50">
                {top1.approvedCalls} godkjente samtaler · beste score {top1.bestScore}
              </p>
              <p className="label-mono mt-2 text-signal">Premie: 1:1 med Sebastian</p>
            </div>
            <p className="shrink-0 font-mono text-3xl font-semibold tracking-tight text-bone sm:text-4xl">
              {top1.points}
              <span className="ml-1 label-mono text-bone/40">P</span>
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {top23.map((e) => (
          <div key={e.rank} className="border border-line p-5">
            <div className="flex items-center gap-4">
              <span className="font-display text-3xl leading-none tracking-tight text-bone/40 sm:text-4xl">
                {String(e.rank).padStart(2, '0')}
              </span>
              <div className="w-14 shrink-0">
                <MediaPlaceholder kind="image" ratio="1/1" size="sm" label="Profilbilde" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base uppercase tracking-tight text-bone">
                  {e.name}
                </p>
                <p className="label-mono mt-1 text-bone/50">
                  {e.approvedCalls} samtaler · beste {e.bestScore}
                </p>
              </div>
              <p className="shrink-0 font-mono text-xl font-semibold text-bone">
                {e.points}
                <span className="ml-1 label-mono text-bone/40">P</span>
              </p>
            </div>
            <p className="label-mono mt-4 border-t border-line pt-3 text-signal">
              Premie: 1:1 med Sebastian
            </p>
          </div>
        ))}
      </div>

      {/* Resten — mono-tabell */}
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[28rem] text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="label-mono px-4 py-3 font-medium text-bone/40">Rank</th>
              <th className="label-mono px-4 py-3 font-medium text-bone/40">Navn</th>
              <th className="label-mono px-4 py-3 font-medium text-bone/40">Samtaler</th>
              <th className="label-mono px-4 py-3 font-medium text-bone/40">Beste</th>
              <th className="label-mono px-4 py-3 text-right font-medium text-bone/40">
                Poeng
              </th>
            </tr>
          </thead>
          <tbody>
            {rest.map((e) => (
              <tr
                key={e.rank}
                className={`border-b border-line last:border-0 ${
                  e.isYou ? 'bg-signal/10' : ''
                }`}
              >
                <td className="px-4 py-3 font-mono text-sm text-bone/50">
                  {String(e.rank).padStart(2, '0')}
                </td>
                <td className="px-4 py-3 font-mono text-sm font-semibold text-bone">
                  {e.name}
                  {e.isYou && <span className="label-mono ml-2 text-signal">(deg)</span>}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-bone/60">
                  {e.approvedCalls}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-bone/60">{e.bestScore}</td>
                <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-bone">
                  {e.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
