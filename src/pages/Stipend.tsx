// SKJULT SIDE — kun for oppfølgings-løpet (e-post/SMS etter 7 dager).
// Skal IKKE lenkes fra landing, nav, footer eller FAQ — kun direkte URL.
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Icon from '../components/Icon';
import SectionDivider from '../components/SectionDivider';
import { submitApplication } from '../lib/data';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const STIPEND_COHORT = 'STIPEND — opptak 3';

const stipendFakta = [
  'Begrenset antall stipendplasser per opptak — for kandidater med sterk motivasjon, men trang økonomi',
  'Stipendet dekker inntil 75 % av kursavgiften — egenandel fra 2 498 kr',
  'Vurderes individuelt etter en kort samtale',
  'Jobbgarantien gjelder fullt ut — samme vilkår som ordinær plass',
];

export default function Stipend() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    motivation: '',
    angrerett: false,
  });

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().split(/\s+/).length < 2) {
      errors.name = 'Skriv inn fullt navn (fornavn og etternavn).';
    }
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 8) {
      errors.phone = 'Telefonnummer må ha minst 8 siffer.';
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      errors.email = 'Skriv inn en gyldig e-postadresse.';
    }
    if (!form.motivation.trim()) {
      errors.motivation = 'Fortell oss kort hvorfor du fortjener stipendplassen.';
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
      age: 0,
      email: form.email.trim(),
      phone: form.phone.trim(),
      motivation: form.motivation.trim(),
      cohort: STIPEND_COHORT,
    });
    setSubmitted(true);
  }

  const inputCls =
    'w-full rounded-none border border-line bg-bone/5 px-4 py-3 text-sm text-bone placeholder-bone/30 focus:border-signal focus:outline-none';
  const inputErrCls =
    'w-full rounded-none border border-red-500/70 bg-bone/5 px-4 py-3 text-sm text-bone placeholder-bone/30 focus:border-red-500 focus:outline-none';
  const labelCls = 'label-mono mb-2 block text-bone/60';

  function FieldError({ field }: { field: string }) {
    if (!fieldErrors[field]) return null;
    return (
      <p role="alert" className="mt-1.5 font-mono text-xs font-medium text-red-400">
        {fieldErrors[field]}
      </p>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-ink">
        <Navbar />
        <main className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <div className="mb-8 flex h-16 w-16 items-center justify-center border-2 border-win text-win">
            <Icon name="check" size={28} />
          </div>
          <h1 className="font-display text-4xl uppercase leading-[0.95] tracking-tight text-bone sm:text-5xl">
            Stipendsøknad mottatt!
          </h1>
          <p className="mt-6 leading-relaxed text-bone/70">
            Takk, {form.name.split(' ')[0]}! Vi har mottatt stipendsøknaden din.
            Du hører fra oss innen 48 timer — sjekk innboksen (og søppelposten)
            på {form.email}.
          </p>
          <p className="label-mono mt-6 border-t border-line pt-6 leading-relaxed text-bone/50">
            Neste steg: en kort telefonsamtale der vi vurderer søknaden din
            individuelt. Ingen forberedelse nødvendig.
          </p>
          <div className="mt-10">
            <Button to="/">Tilbake til forsiden</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Navbar />
      <SectionDivider index={1} name="Stipendprogrammet" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-10">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          {/* VENSTRE: Skjema */}
          <div className="lg:col-span-3">
            <p className="label-mono text-signal">— Stipendprogrammet</p>
            <h1 className="mt-4 font-display text-4xl uppercase leading-[0.95] tracking-tight text-bone sm:text-6xl">
              Søk om stipendplass.
            </h1>
            <p className="mt-5 max-w-lg leading-relaxed text-bone/60">
              Vi holder av et begrenset antall stipendplasser per opptak for
              kandidater med sterk motivasjon, men trang økonomi. Stipendet
              dekker inntil 75 % av kursavgiften, og søknadene vurderes
              individuelt etter en kort samtale.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6" noValidate>
              <div>
                <label htmlFor="name" className={labelCls}>
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className={labelCls}>
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
                  <label htmlFor="phone" className={labelCls}>
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
                <label htmlFor="motivation" className={labelCls}>
                  Hvorfor fortjener du stipendplassen?
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

              <label className="flex cursor-pointer items-start gap-3 border border-line bg-bone/5 p-4 text-sm leading-relaxed text-bone/70">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-signal"
                  checked={form.angrerett}
                  onChange={(e) => setForm({ ...form, angrerett: e.target.checked })}
                />
                <span>
                  Jeg bekrefter at jeg har lest{' '}
                  <Link to="/vilkar" className="text-signal underline underline-offset-2">
                    kjøpsvilkårene og informasjonen om 14 dagers angrerett
                  </Link>
                  . Hvis jeg får plass og velger å starte kurset før angrefristen er
                  ute, gir jeg uttrykkelig samtykke til at leveringen starter — og
                  erkjenner at jeg da betaler for den delen som er levert dersom
                  jeg benytter angreretten.
                </span>
              </label>

              {error && (
                <p className="border border-red-500/60 bg-red-500/10 p-3 font-mono text-sm text-red-300">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full">
                Send stipendsøknad — helt gratis
              </Button>
              <p className="label-mono text-center leading-relaxed text-bone/40">
                Søknaden er ikke en bindende bestilling. Betaling skjer først
                ved tilbudt og akseptert studieplass.
              </p>
            </form>
          </div>

          {/* HØYRE: Sticky fakta */}
          <aside className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <div className="border border-line">
                <p className="label-mono border-b border-line px-5 py-3 text-bone/60">
                  Slik fungerer stipendet
                </p>
                {stipendFakta.map((f, i) => (
                  <div
                    key={f}
                    className="grid grid-cols-[3rem_1fr] gap-x-3 border-b border-line p-5 last:border-b-0"
                  >
                    <span className="font-mono text-2xl font-semibold text-signal">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-sm leading-relaxed text-bone/70">{f}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-2 border-signal p-5">
                <p className="label-mono text-bone/60">Grunnleggerpris opptak 3</p>
                <p className="mt-2 font-mono text-2xl font-semibold text-bone">
                  9 990 kr
                </p>
                <p className="label-mono mt-3 text-signal">
                  Med stipend: egenandel fra 2 498 kr
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
