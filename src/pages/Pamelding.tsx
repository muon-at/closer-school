import { useState, type FormEvent } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { submitApplication, getCohorts } from '../lib/data';
import { Link } from 'react-router-dom';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Pamelding() {
  const cohorts = getCohorts();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '',
    age: '',
    email: '',
    phone: '',
    motivation: '',
    cohort: cohorts[0],
    angrerett: false,
  });

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().split(/\s+/).length < 2) {
      errors.name = 'Skriv inn fullt navn (fornavn og etternavn).';
    }
    const ageNum = Number(form.age);
    if (!form.age.trim() || !Number.isFinite(ageNum)) {
      errors.age = 'Alder må være et tall.';
    } else if (ageNum < 18) {
      errors.age = 'Du må være minst 18 år for å søke.';
    } else if (ageNum > 99) {
      errors.age = 'Skriv inn en gyldig alder.';
    }
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 8) {
      errors.phone = 'Telefonnummer må ha minst 8 siffer.';
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      errors.email = 'Skriv inn en gyldig e-postadresse.';
    }
    if (!form.motivation.trim()) {
      errors.motivation = 'Fortell oss kort hvorfor du søker.';
    }
    return errors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Rett feltene som er merket med rødt, så prøver du igjen.');
      return;
    }
    if (!form.angrerett) {
      setError('Du må bekrefte at du har lest informasjonen om angrerett.');
      return;
    }
    await submitApplication({
      name: form.name.trim(),
      age: Number(form.age),
      email: form.email.trim(),
      phone: form.phone.trim(),
      motivation: form.motivation.trim(),
      cohort: form.cohort,
    });
    setSubmitted(true);
  }

  const inputCls =
    'w-full rounded-xl border border-white/15 bg-zinc-900/80 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-500/60 focus:outline-none';
  const inputErrCls =
    'w-full rounded-xl border border-red-500/60 bg-zinc-900/80 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none';

  function FieldError({ field }: { field: string }) {
    if (!fieldErrors[field]) return null;
    return (
      <p role="alert" className="mt-1 text-xs font-medium text-red-400">
        {fieldErrors[field]}
      </p>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950">
        <Navbar />
        <main className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl">
            ✅
          </div>
          <h1 className="text-3xl font-black text-white">Søknad mottatt!</h1>
          <p className="mt-4 text-zinc-300">
            Takk, {form.name.split(' ')[0]}! Vi har mottatt søknaden din til{' '}
            <span className="font-semibold text-white">{form.cohort}</span>. Du
            hører fra oss innen 48 timer — sjekk innboksen (og søppelposten) på{' '}
            {form.email}.
          </p>
          <p className="mt-4 text-sm text-zinc-500">
            Neste steg: en kort og uformell telefonsamtale. Ingen forberedelse
            nødvendig — vi vil bare høre hvorfor du vil dette.
          </p>
          <div className="mt-8">
            <Button to="/">Tilbake til forsiden</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Navbar />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-16">
        <Badge tone="amber" className="mb-4">23 plasser per kull</Badge>
        <h1 className="text-3xl font-black text-white sm:text-4xl">
          Søk plass på Closerskolen
        </h1>
        <p className="mt-3 text-zinc-400">
          Gratis og uforpliktende. Vi ser ikke etter perfekte CV-er — vi ser
          etter sult.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-300">
              Fullt navn
            </label>
            <input
              id="name"
              className={fieldErrors.name ? inputErrCls : inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ola Nordmann"
            />
            <FieldError field="name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="mb-1 block text-sm font-medium text-zinc-300">
                Alder
              </label>
              <input
                id="age"
                type="number"
                min={18}
                max={99}
                className={fieldErrors.age ? inputErrCls : inputCls}
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="18"
              />
              <FieldError field="age" />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-zinc-300">
                Telefon
              </label>
              <input
                id="phone"
                type="tel"
                className={fieldErrors.phone ? inputErrCls : inputCls}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="912 34 567"
              />
              <FieldError field="phone" />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-300">
              E-post
            </label>
            <input
              id="email"
              type="email"
              className={fieldErrors.email ? inputErrCls : inputCls}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="deg@epost.no"
            />
            <FieldError field="email" />
          </div>
          <div>
            <label htmlFor="cohort" className="mb-1 block text-sm font-medium text-zinc-300">
              Hvilket kull søker du til?
            </label>
            <select
              id="cohort"
              className={inputCls}
              value={form.cohort}
              onChange={(e) => setForm({ ...form, cohort: e.target.value })}
            >
              {cohorts.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="motivation" className="mb-1 block text-sm font-medium text-zinc-300">
              Hvorfor deg? Fortell oss hvorfor du kommer til å fullføre.
            </label>
            <textarea
              id="motivation"
              rows={5}
              className={fieldErrors.motivation ? inputErrCls : inputCls}
              value={form.motivation}
              onChange={(e) => setForm({ ...form, motivation: e.target.value })}
              placeholder="Vær ærlig. Vi leser alt."
            />
            <FieldError field="motivation" />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-zinc-900/60 p-4 text-sm text-zinc-300">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-amber-500"
              checked={form.angrerett}
              onChange={(e) => setForm({ ...form, angrerett: e.target.checked })}
            />
            <span>
              Jeg bekrefter at jeg har lest{' '}
              <Link to="/vilkar" className="text-amber-400 underline">
                kjøpsvilkårene og informasjonen om 14 dagers angrerett
              </Link>
              . Hvis jeg får plass og velger å starte kurset før angrefristen er
              ute, gir jeg uttrykkelig samtykke til at leveringen starter — og
              erkjenner at jeg da betaler for den delen som er levert dersom
              jeg benytter angreretten.
            </span>
          </label>

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full">
            Send søknad — helt gratis
          </Button>
          <p className="text-center text-xs text-zinc-500">
            Søknaden er ikke en bindende bestilling. Betaling skjer først ved
            tilbudt og akseptert studieplass.
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}
