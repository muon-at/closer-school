import { useEffect, useState } from 'react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { getJobs } from '../../lib/data';
import type { Job } from '../../lib/types';

export default function Jobber() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applied, setApplied] = useState<string[]>([]);

  useEffect(() => {
    void getJobs().then(setJobs);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white sm:text-3xl">Jobbtavle 💼</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Stillinger fra partnerbedriftene våre. Søker du via Closerskolen,
          følger sertifikatet og AI-scorene dine med søknaden — arbeidsgiverne
          vet nøyaktig hva de får.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {jobs.map((j) => (
          <Card key={j.id} className="flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-white">{j.title}</h2>
                <p className="text-sm text-zinc-400">{j.company}</p>
              </div>
              <Badge tone="zinc">{j.type}</Badge>
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-300">{j.description}</p>
            <dl className="mt-4 space-y-1 text-sm">
              <div className="flex gap-2">
                <dt aria-hidden>📍</dt>
                <dd className="text-zinc-400">{j.location}</dd>
              </div>
              <div className="flex gap-2">
                <dt aria-hidden>💰</dt>
                <dd className="text-zinc-400">{j.pay}</dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              {j.tags.map((t) => (
                <Badge key={t} tone={t === 'Garanti-partner' ? 'green' : 'zinc'}>{t}</Badge>
              ))}
            </div>
            <div className="mt-4">
              {applied.includes(j.id) ? (
                <p className="text-sm font-semibold text-emerald-400">
                  ✓ Søknad sendt via Closerskolen — vi tar kontakt!
                </p>
              ) : (
                <Button onClick={() => setApplied([...applied, j.id])} className="w-full">
                  Søk via Closerskolen →
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
