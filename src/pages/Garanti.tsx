import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Icon from '../components/Icon';
import SectionDivider from '../components/SectionDivider';

const vilkar = [
  {
    n: 1,
    title: 'Bestått avsluttende eksamen',
    text: 'Du må ha bestått hele eksamen: teoriprøven (minst 80 % riktig), AI-eksamenssamtalen (score minst 80/100) og den ekte kundesamtalen med sensor. Eksamen er kvalitetsporten som gjør at vi kan gå god for deg overfor arbeidsgivere.',
  },
  {
    n: 2,
    title: 'Fullført program og AI-trening',
    text: 'Alle 6 moduler må være fullført (leksjoner + quiz), og du må ha minst 25 godkjente AI-treningssamtaler. Dette er dokumentasjonen på at du faktisk har lagt ned treningen.',
  },
  {
    n: 3,
    title: 'Delta i formidlingen',
    text: 'Du må møte til intervjuer og eventuelle prøvedager vi formidler, forberedt og til avtalt tid. Vi stiller opp for deg — du stiller opp for prosessen.',
  },
  {
    n: 4,
    title: 'Grunnkrav',
    text: 'Du må være fylt 18 år, være bosatt i Norge og være arbeidsfør i garantiperioden. Jobbtilbudene forutsetter at du lovlig kan ta arbeid i Norge.',
  },
  {
    n: 5,
    title: 'Kvalifiserte jobbtilbud teller',
    text: 'Takker du nei til et kvalifisert jobbtilbud — en reell salgsstilling hos oss, i våre partnerselskaper (inkludert selskaper i Muon-konsernet) eller hos annen arbeidsgiver vi formidler — bortfaller garantien. Kvalifisert betyr: salgsrolle, lovlige vilkår og innenfor rimelig pendleravstand eller remote.',
  },
  {
    n: 6,
    title: 'Frist for refusjonskrav',
    text: 'Krav om refusjon må fremmes skriftlig (e-post er nok) innen 30 dager etter at 90-dagersperioden er utløpt. Refusjon utbetales innen 14 dager etter godkjent krav — 100 % av innbetalt kursavgift.',
  },
];

export default function Garanti() {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Navbar />
      <SectionDivider index={1} name="Jobbgarantien — fulle vilkår" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-10">
        <p className="label-mono flex items-center gap-2 text-win">
          <Icon name="check" size={14} />— Jobbgarantien — fulle vilkår
        </p>
        <h1 className="mt-5 font-display text-4xl uppercase leading-[0.95] tracking-tight text-bone sm:text-5xl">
          Jobbtilbud innen 90 dager — eller hver krone tilbake
        </h1>
        <p className="mt-6 leading-relaxed text-bone/70">
          Løftet vårt er enkelt:{' '}
          <span className="font-semibold text-bone">
            Får du ikke tilbud om salgsjobb innen 90 dager etter bestått
            eksamen, refunderer vi 100 % av kursavgiften.
          </span>{' '}
          Ingen stjerner i margen som overrasker deg senere — alle vilkårene
          står her, åpent, sånn som Forbrukertilsynet krever og sånn vi
          uansett ville gjort det.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-bone/50">
          Garantiperioden starter dagen du består siste del av eksamen (den
          ekte kundesamtalen). For at garantien skal gjelde, må disse seks
          vilkårene være oppfylt:
        </p>

        <ol className="mt-10 border-t border-line">
          {vilkar.map((v) => (
            <li key={v.n} className="grid grid-cols-[3.5rem_1fr] gap-x-4 border-b border-line py-6">
              <span className="font-mono text-3xl font-semibold text-signal">
                {String(v.n).padStart(2, '0')}
              </span>
              <div>
                <h2 className="font-display text-lg uppercase tracking-tight text-bone">
                  {v.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-bone/60">{v.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 border-2 border-win p-6">
          <h2 className="label-mono text-win">— Hvorfor tør vi love dette?</h2>
          <p className="mt-3 text-sm leading-relaxed text-bone/70">
            Fordi garantien ikke er et sjansespill for oss: eksamen siler ut
            dem som ikke er klare, AI-treningen dokumenterer ferdighetene dine,
            og vi har arbeidsgiverpartnere — inkludert salgsselskaper i eget
            konsern — som trenger nettopp ferdigtrente, eksamens-beviste
            selgere. Garantien er ikke markedsføring med liten skrift. Den er
            forretningsmodellen vår.
          </p>
        </div>

        <p className="mt-10 text-xs leading-relaxed text-bone/40">
          Garantien kommer i tillegg til — og begrenser aldri — rettighetene
          dine etter norsk forbrukerlovgivning, inkludert 14 dagers angrerett
          etter angrerettloven. Se{' '}
          <a href="/vilkar" className="text-signal underline underline-offset-2">
            kjøpsvilkårene
          </a>{' '}
          for detaljer.
        </p>

        <div className="mt-12 border-t border-line pt-10 text-center">
          <Button to="/pamelding" size="lg">
            Søk plass på kull 3 <Icon name="arrow-right" size={16} />
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
