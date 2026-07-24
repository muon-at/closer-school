import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { getApplications, getStudents, getJobs } from '../lib/data';
import type { Application, Job, StudentRow } from '../lib/types';

export default function Admin() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tab, setTab] = useState<'studenter' | 'soknader' | 'jobber' | 'booking'>('studenter');

  useEffect(() => {
    void (async () => {
      const [s, a, j] = await Promise.all([getStudents(), getApplications(), getJobs()]);
      setStudents(s);
      setApps(a);
      setJobs(j);
    })();
  }, []);

  // Demo-handlinger (lokal state — i produksjon: Supabase-oppdateringer bak RLS)
  function setAppStatus(id: string, status: Application['status']) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  function addJob() {
    const title = window.prompt?.('Tittel på ny stilling:', 'TM-selger — ny partner');
    if (!title) return;
    setJobs((prev) => [
      {
        id: `job-${Date.now()}`,
        title,
        company: 'Partnerbedrift AS',
        location: 'Etter avtale',
        pay: 'Etter avtale',
        type: 'Fulltid',
        description: 'Utkast — rediger stillingen for å fylle inn detaljer.',
        tags: ['Utkast'],
      },
      ...prev,
    ]);
  }

  function editJob(id: string) {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    const title = window.prompt?.('Ny tittel:', job.title);
    if (!title) return;
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, title } : j)));
  }

  function removeJob(id: string) {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }

  const tabs = [
    { id: 'studenter' as const, label: `Studenter (${students.length})` },
    { id: 'soknader' as const, label: `Søknader (${apps.length})` },
    { id: 'jobber' as const, label: `Jobbtavle (${jobs.length})` },
    { id: 'booking' as const, label: 'Eksamens-booking' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-white/10 px-4 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <Link to="/" className="font-bold text-white">← Closerskolen</Link>
          <Badge tone="red">Admin — krever admin-rolle i produksjon (RLS)</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-black text-white sm:text-3xl">Admin</h1>

        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                tab === t.id
                  ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                  : 'border-white/15 text-zinc-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'studenter' && (
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Navn</th>
                  <th className="px-4 py-3">Kull</th>
                  <th className="px-4 py-3">Moduler</th>
                  <th className="px-4 py-3">AI-samtaler</th>
                  <th className="px-4 py-3">Snitt-score</th>
                  <th className="px-4 py-3">Eksamen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((s) => (
                  <tr key={s.id} className="text-zinc-300">
                    <td className="px-4 py-3 font-semibold text-white">{s.name}</td>
                    <td className="px-4 py-3">{s.cohort}</td>
                    <td className="px-4 py-3">{s.modulesCompleted}/6</td>
                    <td className="px-4 py-3">{s.approvedCalls}/25</td>
                    <td className="px-4 py-3">{s.avgScore}</td>
                    <td className="px-4 py-3 text-xs">{s.examStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === 'soknader' && (
          <div className="space-y-4">
            {apps.map((a) => (
              <Card key={a.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">
                      {a.name} ({a.age})
                    </p>
                    <p className="text-xs text-zinc-500">
                      {a.email} · {a.phone} · {a.cohort} · mottatt {a.createdAt}
                    </p>
                  </div>
                  <Badge tone={a.status === 'ny' ? 'amber' : a.status === 'akseptert' ? 'green' : 'zinc'}>
                    {a.status}
                  </Badge>
                </div>
                <p className="mt-3 rounded-xl bg-white/5 p-3 text-sm italic text-zinc-300">
                  «{a.motivation}»
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="green"
                    disabled={a.status === 'intervju'}
                    onClick={() => setAppStatus(a.id, 'intervju')}
                  >
                    Kall inn til intervju
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={a.status === 'avslått'}
                    onClick={() => setAppStatus(a.id, 'avslått')}
                  >
                    Avslå
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'jobber' && (
          <div className="space-y-4">
            <Button size="sm" onClick={addJob}>+ Ny stilling</Button>
            {jobs.map((j) => (
              <Card key={j.id} className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-white">{j.title}</p>
                  <p className="text-xs text-zinc-500">
                    {j.company} · {j.location} · {j.pay}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => editJob(j.id)}>Rediger</Button>
                  <Button size="sm" variant="ghost" onClick={() => removeJob(j.id)}>Fjern</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'booking' && (
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Tidspunkt</th>
                  <th className="px-4 py-3">Sensor</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                <tr>
                  <td className="px-4 py-3 font-semibold text-white">Sara M.</td>
                  <td className="px-4 py-3">Tirsdag 10:00</td>
                  <td className="px-4 py-3">Sebastian</td>
                  <td className="px-4 py-3"><Badge tone="amber">Bekreftet</Badge></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-white">Adrian S.</td>
                  <td className="px-4 py-3">Onsdag 15:00</td>
                  <td className="px-4 py-3">Sebastian</td>
                  <td className="px-4 py-3"><Badge tone="zinc">Venter på lead</Badge></td>
                </tr>
              </tbody>
            </table>
          </Card>
        )}
      </main>
    </div>
  );
}
