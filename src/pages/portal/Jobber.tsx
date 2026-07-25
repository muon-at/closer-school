import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import PageHeader from '../../components/PageHeader';
import { getJobs } from '../../lib/data';
import type { Job } from '../../lib/types';

export default function Jobber() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applied, setApplied] = useState<string[]>([]);

  useEffect(() => {
    void getJobs().then(setJobs);
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Jobber"
        title="Jobbtavle"
        sub="Stillinger fra partnerbedriftene våre. Søker du via Closerskolen, følger sertifikatet og AI-scorene dine med søknaden — arbeidsgiverne vet nøyaktig hva de får."
        right={
          <p className="font-mono text-sm font-semibold text-bone">
            {jobs.length}{' '}
            <span className="label-mono text-bone/40">åpne stillinger</span>
          </p>
        }
      />

      {/* Tavle-header */}
      <div className="hidden border-b border-line pb-2 lg:grid lg:grid-cols-12 lg:gap-6">
        <span className="label-mono col-span-5 text-bone/40">Stilling</span>
        <span className="label-mono col-span-4 text-bone/40">Lønn</span>
        <span className="label-mono col-span-3 text-right text-bone/40">Handling</span>
      </div>

      {/* Jobbrader */}
      <div className="-mt-4">
        {jobs.map((j) => {
          const isPartner = j.tags.includes('Garanti-partner');
          return (
            <div
              key={j.id}
              className="grid gap-4 border-b border-line py-6 lg:grid-cols-12 lg:gap-6"
            >
              {/* Venstre: tittel + selskap/sted */}
              <div className="min-w-0 lg:col-span-5">
                <h2 className="font-display text-base uppercase leading-tight tracking-tight text-bone sm:text-lg">
                  {j.title}
                </h2>
                <p className="label-mono mt-2 text-bone/50">
                  {j.company} · {j.location} · {j.type}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-bone/50">
                  {j.description}
                </p>
              </div>

              {/* Midt: lønn */}
              <div className="lg:col-span-4">
                <p className="label-mono text-bone/40 lg:hidden">Lønn</p>
                <p className="mt-1 font-mono text-sm leading-relaxed text-bone/80 lg:mt-0">
                  {j.pay}
                </p>
              </div>

              {/* Høyre: tags + søk */}
              <div className="flex flex-col gap-3 lg:col-span-3 lg:items-end">
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {isPartner && (
                    <span className="label-mono border border-win px-2 py-0.5 text-win">
                      Garanti-partner
                    </span>
                  )}
                  {j.tags
                    .filter((t) => t !== 'Garanti-partner')
                    .map((t) => (
                      <span
                        key={t}
                        className="label-mono border border-line px-2 py-0.5 text-bone/50"
                      >
                        {t}
                      </span>
                    ))}
                </div>
                {applied.includes(j.id) ? (
                  <p className="label-mono flex items-center gap-1.5 text-win">
                    <Icon name="check" size={13} />
                    Søknad sendt — vi tar kontakt!
                  </p>
                ) : (
                  <Button size="sm" onClick={() => setApplied([...applied, j.id])}>
                    Søk via Closerskolen <Icon name="arrow-right" size={14} />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
