import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';

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
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
        <Badge tone="green" className="mb-4">🛡️ Jobbgarantien — fulle vilkår</Badge>
        <h1 className="text-3xl font-black text-white sm:text-4xl">
          Jobbtilbud innen 90 dager — eller hver krone tilbake
        </h1>
        <p className="mt-4 leading-relaxed text-zinc-300">
          Løftet vårt er enkelt:{' '}
          <span className="font-semibold text-white">
            Får du ikke tilbud om salgsjobb innen 90 dager etter bestått
            eksamen, refunderer vi 100 % av kursavgiften.
          </span>{' '}
          Ingen stjerner i margen som overrasker deg senere — alle vilkårene
          står her, åpent, sånn som Forbrukertilsynet krever og sånn vi
          uansett ville gjort det.
        </p>
        <p className="mt-3 text-sm text-zinc-400">
          Garantiperioden starter dagen du består siste del av eksamen (den
          ekte kundesamtalen). For at garantien skal gjelde, må disse seks
          vilkårene være oppfylt:
        </p>

        <div className="mt-8 space-y-4">
          {vilkar.map((v) => (
            <Card key={v.n} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-400">
                {v.n}
              </span>
              <div>
                <h2 className="font-bold text-white">{v.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">{v.text}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8" accent="green">
          <h2 className="font-bold text-white">Hvorfor tør vi love dette?</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            Fordi garantien ikke er et sjansespill for oss: eksamen siler ut
            dem som ikke er klare, AI-treningen dokumenterer ferdighetene dine,
            og vi har arbeidsgiverpartnere — inkludert salgsselskaper i eget
            konsern — som trenger nettopp ferdigtrente, eksamens-beviste
            selgere. Garantien er ikke markedsføring med liten skrift. Den er
            forretningsmodellen vår.
          </p>
        </Card>

        <p className="mt-8 text-xs text-zinc-500">
          Garantien kommer i tillegg til — og begrenser aldri — rettighetene
          dine etter norsk forbrukerlovgivning, inkludert 14 dagers angrerett
          etter angrerettloven. Se{' '}
          <a href="/vilkar" className="text-amber-400 underline">
            kjøpsvilkårene
          </a>{' '}
          for detaljer.
        </p>

        <div className="mt-10 text-center">
          <Button to="/pamelding" size="lg">Søk plass på kull 3 →</Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
