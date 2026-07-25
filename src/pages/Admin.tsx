import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Icon from '../components/Icon';
import StatCard from '../components/StatCard';
import { getApplications, getStudents, getJobs } from '../lib/data';
import type { Application, Job, StudentRow } from '../lib/types';

type Tab = 'soknader' | 'studenter' | 'jobber' | 'booking';

const appStatusTag: Record<Application['status'], string> = {
  ny: 'border-signal text-signal',
  intervju: 'border-bone/60 text-bone',
  akseptert: 'border-win text-win',
  avslått: 'border-line text-bone/40',
};

// Demo-bookinger for sensor-samtaler (i produksjon: egen tabell i Supabase)
const bookings = [
  { student: 'Sara M.', slot: 'Tirsdag 10:00', sensor: 'Sebastian', status: 'Bekreftet' },
  { student: 'Adrian S.', slot: 'Onsdag 15:00', sensor: 'Sebastian', status: 'Venter på lead' },
];

const th = 'label-mono px-4 py-3 font-medium text-bone/40';
const td = 'px-4 py-3 font-mono text-sm';

export default function Admin() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tab, setTab] = useState<Tab>('studenter');

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

  const newApps = apps.filter((a) => a.status === 'ny').length;
  const avgScore =
    students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.avgScore, 0) / students.length)
      : 0;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'soknader', label: `Søknader (${apps.length})` },
    { id: 'studenter', label: `Studenter (${students.length})` },
    { id: 'jobber', label: `Jobber (${jobs.length})` },
    { id: 'booking', label: `Bookinger (${bookings.length})` },
  ];

  return (
    <div className="min-h-screen bg-ink">
      {/* Produksjonsmerknad som mono-banner */}
      <div className="label-mono border-b border-signal/40 bg-signal/10 px-4 py-2.5 text-center text-signal">
        Admin — krever admin-rolle i produksjon (RLS)
      </div>

      <header className="border-b border-line px-4 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="font-display text-base uppercase tracking-tight text-bone hover:text-signal"
          >
            ← Closer<span className="text-signal">skolen</span>
          </Link>
          <span className="label-mono text-bone/40">Opptak 2 + 3 · demo-data</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div className="border-b border-line pb-6">
          <p className="label-mono mb-3 text-signal">— Admin</p>
          <h1 className="font-display text-2xl uppercase leading-[0.95] tracking-tight text-bone sm:text-4xl">
            Kontrollrommet
          </h1>
        </div>

        {/* Nøkkeltall fra demo-data */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Nye søknader"
            value={String(newApps)}
            sub="venter på behandling"
            icon={<Icon name="clipboard" size={16} />}
          />
          <StatCard
            label="Aktive studenter"
            value={String(students.length)}
            sub="på tvers av opptakene"
            icon={<Icon name="user" size={16} />}
          />
          <StatCard
            label="Snitt AI-score"
            value={String(avgScore)}
            sub="alle studenter"
            icon={<Icon name="chart" size={16} />}
          />
          <StatCard
            label="Sensorsamtaler"
            value={String(bookings.length)}
            sub="bookede eksamenssamtaler"
            icon={<Icon name="calendar" size={16} />}
          />
        </div>

        {/* Toppfaner */}
        <div className="flex flex-wrap gap-0 border-b border-line">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`label-mono -mb-px border-b-2 px-4 py-3 transition-colors ${
                tab === t.id
                  ? 'border-signal text-signal'
                  : 'border-transparent text-bone/50 hover:text-bone'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* SØKNADER */}
        {tab === 'soknader' && (
          <div className="overflow-x-auto border border-line">
            <table className="w-full min-w-[52rem] text-left">
              <thead>
                <tr className="border-b border-line">
                  <th className={th}>Kandidat</th>
                  <th className={th}>Kontakt</th>
                  <th className={th}>Opptak</th>
                  <th className={th}>Mottatt</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Handling</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a.id} className="border-b border-line align-top last:border-0">
                    <td className={`${td} text-bone`}>
                      <p className="font-semibold">
                        {a.name} ({a.age})
                      </p>
                      <p className="mt-1 max-w-[16rem] whitespace-normal font-body text-xs italic leading-relaxed text-bone/50">
                        «{a.motivation}»
                      </p>
                    </td>
                    <td className={`${td} text-bone/60`}>
                      <p>{a.email}</p>
                      <p className="mt-1">{a.phone}</p>
                    </td>
                    <td className={`${td} text-bone/60`}>{a.cohort}</td>
                    <td className={`${td} text-bone/60`}>{a.createdAt}</td>
                    <td className={td}>
                      <span
                        className={`label-mono border px-2 py-0.5 ${appStatusTag[a.status]}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className={`${td} text-right`}>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={a.status === 'intervju'}
                          onClick={() => setAppStatus(a.id, 'intervju')}
                        >
                          Intervju
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={a.status === 'avslått'}
                          onClick={() => setAppStatus(a.id, 'avslått')}
                          className="border border-line"
                        >
                          Avslå
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* STUDENTER */}
        {tab === 'studenter' && (
          <div className="overflow-x-auto border border-line">
            <table className="w-full min-w-[48rem] text-left">
              <thead>
                <tr className="border-b border-line">
                  <th className={th}>Navn</th>
                  <th className={th}>Opptak</th>
                  <th className={th}>Moduler</th>
                  <th className={th}>AI-samtaler</th>
                  <th className={th}>Snitt-score</th>
                  <th className={th}>Eksamen</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-0">
                    <td className={`${td} font-semibold text-bone`}>{s.name}</td>
                    <td className={`${td} text-bone/60`}>{s.cohort}</td>
                    <td className={`${td} text-bone/60`}>{s.modulesCompleted}/6</td>
                    <td className={`${td} text-bone/60`}>{s.approvedCalls}/25</td>
                    <td
                      className={`${td} font-semibold ${
                        s.avgScore >= 80 ? 'text-win' : 'text-bone/80'
                      }`}
                    >
                      {s.avgScore}
                    </td>
                    <td className={`${td} text-xs text-bone/60`}>{s.examStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* JOBBER */}
        {tab === 'jobber' && (
          <div className="space-y-4">
            <Button size="sm" onClick={addJob}>
              + Ny stilling
            </Button>
            <div className="overflow-x-auto border border-line">
              <table className="w-full min-w-[44rem] text-left">
                <thead>
                  <tr className="border-b border-line">
                    <th className={th}>Stilling</th>
                    <th className={th}>Selskap</th>
                    <th className={th}>Sted</th>
                    <th className={th}>Lønn</th>
                    <th className={`${th} text-right`}>Handling</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.id} className="border-b border-line last:border-0">
                      <td className={`${td} font-semibold text-bone`}>{j.title}</td>
                      <td className={`${td} text-bone/60`}>{j.company}</td>
                      <td className={`${td} text-bone/60`}>{j.location}</td>
                      <td className={`${td} max-w-[14rem] whitespace-normal text-xs text-bone/60`}>
                        {j.pay}
                      </td>
                      <td className={`${td} text-right`}>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => editJob(j.id)}>
                            Rediger
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeJob(j.id)}
                            className="border border-line"
                          >
                            Fjern
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BOOKINGER */}
        {tab === 'booking' && (
          <div className="overflow-x-auto border border-line">
            <table className="w-full min-w-[36rem] text-left">
              <thead>
                <tr className="border-b border-line">
                  <th className={th}>Student</th>
                  <th className={th}>Tidspunkt</th>
                  <th className={th}>Sensor</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.student} className="border-b border-line last:border-0">
                    <td className={`${td} font-semibold text-bone`}>{b.student}</td>
                    <td className={`${td} text-bone/60`}>{b.slot}</td>
                    <td className={`${td} text-bone/60`}>{b.sensor}</td>
                    <td className={td}>
                      <span
                        className={`label-mono border px-2 py-0.5 ${
                          b.status === 'Bekreftet'
                            ? 'border-win text-win'
                            : 'border-line text-bone/50'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
