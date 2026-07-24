// JURIDISK MERKNAD (intern): Dette er et solid utkast til kjøpsvilkår og
// angrerettinformasjon, skrevet etter angrerettloven og forbrukerkjøpspraksis.
// MÅ GJENNOMGÅS AV ADVOKAT før publisering/lansering (est. ~1 dag arbeid).
// Sjekkliste for advokat: angrerettskjema (vedlegg), oppstart før angrefrist,
// delbetalingsavtalens utforming, verneting, og samspillet garanti/angrerett.
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Card from '../components/Card';

const sections = [
  {
    title: '1. Partene og avtalen',
    body: 'Selger er Closerskolen / Muon Holding AS (org.nr settes inn), heretter «Closerskolen». Kjøper er den forbrukeren som aksepterer tilbud om studieplass, heretter «studenten». Avtalen består av disse vilkårene, ordrebekreftelsen og garantivilkårene (egen side).',
  },
  {
    title: '2. Hva du kjøper',
    body: 'Closerskolen er et 8-ukers digitalt salgsprogram: 6 kursmoduler (video, tekst, quiz), ubegrenset tilgang til AI-salgscoach i kursperioden, eksamen med sertifikat (teori, AI-samtale og reell kundesamtale med sensor), 3 måneders tilgang til Closerskolen Community, samt jobbgaranti på vilkårene angitt på garantisiden. Kursstart og varighet fremgår av ordrebekreftelsen.',
  },
  {
    title: '3. Pris og betaling',
    body: 'Prisen er 29 900 kr, eller rentefri og gebyrfri delbetaling med 6 trekk à 4 983 kr (5 × 4 983 kr + siste trekk på 4 985 kr = 29 900 kr totalt — nøyaktig samme totalpris som ved engangsbetaling; ingen renter, ingen gebyrer, ingen påslag). Betaling skjer først når studieplass er tilbudt og akseptert. Ved delbetaling forfaller første trekk ved kursstart og deretter månedlig. Manglende betaling kan medføre suspensjon av tilgang etter varsel.',
  },
  {
    title: '4. Angrerett (14 dager)',
    body: 'Du har 14 dagers ubetinget angrerett fra avtaleinngåelsen, jf. angrerettloven. For å bruke angreretten gir du oss utvetydig beskjed (e-post er tilstrekkelig) innen fristen — angrerettskjema følger med ordrebekreftelsen. Ønsker du å starte kurset før angrefristen er ute, ber vi om ditt uttrykkelige forhåndssamtykke til at leveringen begynner. Angrer du etter en slik oppstart, betaler du en forholdsmessig andel for det som er levert frem til beskjeden ble gitt; resten refunderes innen 14 dager. Har du gjennomført hele den digitale leveransen før fristen (etter samtykke og erkjennelse av at angreretten da tapes), er angreretten bortfalt for den del.',
  },
  {
    title: '5. Jobbgarantien',
    body: 'Jobbgarantien («jobbtilbud innen 90 dager etter bestått eksamen, ellers 100 % refusjon») gjelder på de seks vilkårene som er publisert på garantisiden. Garantien gir deg rettigheter i tillegg til lovens — den begrenser aldri dine lovbestemte rettigheter.',
  },
  {
    title: '6. Dine forpliktelser',
    body: 'Du forplikter deg til å oppgi riktige opplysninger, holde innloggingen din personlig (tilgangen er individuell og kan ikke deles eller videreselges), og å ikke kopiere eller distribuere kursmateriell. AI-coachen skal brukes til egen trening; misbruk (automatisering, skraping, deling av tilgang) kan medføre stenging uten refusjon etter varsel.',
  },
  {
    title: '7. Avlysning, flytting og force majeure',
    body: 'Closerskolen kan flytte kursstart med inntil 4 uker ved for få deltakere eller andre saklige grunner; du kan da velge full refusjon i stedet. Ved forhold utenfor vår kontroll (force majeure) forskyves forpliktelsene tilsvarende.',
  },
  {
    title: '8. Ansvar og inntektsforventninger',
    body: 'Closerskolen garanterer jobbtilbud etter garantivilkårene — men garanterer ingen bestemt inntekt, provisjon eller karriereutvikling. Eksempler på inntektsnivåer i kursmateriellet er nettopp eksempler, ikke løfter. Vårt samlede erstatningsansvar er begrenset til innbetalt kursavgift, unntatt der annet følger av ufravikelig lov.',
  },
  {
    title: '9. Personvern',
    body: 'Vi behandler personopplysninger (kontaktinfo, progresjon, AI-samtaledata for scoring og kvalitetssikring) etter personvernerklæringen og GDPR. AI-treningssamtaler lagres for å dokumentere progresjon og forbedre opplæringen; du kan kreve innsyn og sletting etter loven.',
  },
  {
    title: '10. Klage og tvister',
    body: 'Ta først kontakt med oss — vi løser det aller meste direkte. Du kan også klage til Forbrukertilsynet eller bruke EU/EØS\' klageportal. Avtalen er underlagt norsk rett med studentens alminnelige verneting.',
  },
];

export default function Vilkar() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
        <h1 className="text-3xl font-black text-white sm:text-4xl">
          Kjøpsvilkår og angrerett
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          Sist oppdatert 24. juli 2026. Kort versjon: gratis å søke, 14 dagers
          angrerett, åpne garantivilkår, og ingen renter på delbetaling. Den
          fulle versjonen står under.
        </p>
        <div className="mt-8 space-y-4">
          {sections.map((s) => (
            <Card key={s.title}>
              <h2 className="font-bold text-white">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.body}</p>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-xs text-zinc-500">
          Spørsmål om vilkårene? Skriv til hei@closerskolen.no — vi svarer på
          vanlig norsk, ikke jusspråk.
        </p>
      </main>
      <Footer />
    </div>
  );
}
