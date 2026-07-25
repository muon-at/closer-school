// Regressionstester for QA-funnene:
// - K1/V4: eksamensflyt (teori → AI-eksamen → booking-gates)
// - V1: påmeldingsvalidering
// - V3: modullås ved dyplenke
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';
import { __resetDemoState, setExamStep } from '../lib/data';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  __resetDemoState();
});

afterEach(cleanup);

describe('Eksamensflyt (K1 + V4)', () => {
  it('Eksamensoppdraget vises IKKE i oppdragsvelgeren før teorieksamen er bestått', async () => {
    renderAt('/portal/ai-coach');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /velg oppdrag/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/tv & strømming \(nysalg\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/eksamensoppdrag/i)).not.toBeInTheDocument();
  });

  it('Eksamensoppdraget vises med EKSAMEN-badge når teorieksamen er bestått', async () => {
    await setExamStep('theory');
    renderAt('/portal/ai-coach');
    await waitFor(() => {
      expect(screen.getByText(/eksamensoppdrag/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/EKSAMEN · nivå 3/i)).toBeInTheDocument();
  });

  it('booking-slots for ekte samtale er deaktivert til steg 1 + 2 er bestått', async () => {
    renderAt('/portal/eksamen');
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /ekte kundesamtale med sensor/i }),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /tirsdag 10:00/i })).toBeDisabled();
    expect(screen.getByText(/låst — bestå teorieksamen/i)).toBeInTheDocument();
  });

  it('booking-slots åpnes når teori + AI-eksamen er bestått', async () => {
    await setExamStep('theory');
    await setExamStep('ai');
    renderAt('/portal/eksamen');
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /ekte kundesamtale med sensor/i }),
      ).toBeInTheDocument();
    });
    const slotButton = screen.getByRole('button', { name: /tirsdag 10:00/i });
    expect(slotButton).toBeEnabled();
    fireEvent.click(slotButton);
    await waitFor(() => {
      expect(screen.getByText(/booket! du får sms-bekreftelse/i)).toBeInTheDocument();
    });
  });
});

describe('Påmeldingsvalidering (V1)', () => {
  function fillForm(overrides: Partial<Record<'name' | 'age' | 'phone' | 'email' | 'motivation', string>> = {}) {
    fireEvent.change(screen.getByLabelText(/fullt navn/i), {
      target: { value: overrides.name ?? 'Ola Nordmann' },
    });
    fireEvent.change(screen.getByLabelText(/alder/i), {
      target: { value: overrides.age ?? '19' },
    });
    fireEvent.change(screen.getByLabelText(/telefon/i), {
      target: { value: overrides.phone ?? '912 34 567' },
    });
    fireEvent.change(screen.getByLabelText(/e-post/i), {
      target: { value: overrides.email ?? 'ola@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/hvorfor deg/i), {
      target: { value: overrides.motivation ?? 'Jeg er sulten og gir meg aldri.' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
  }

  it('avviser ugyldig e-post, alder under 18 og for kort telefonnummer', async () => {
    renderAt('/pamelding');
    fillForm({ email: 'ikke-en-epost', age: '16', phone: '123' });
    fireEvent.click(screen.getByRole('button', { name: /send søknad/i }));
    expect(await screen.findByText(/gyldig e-postadresse/i)).toBeInTheDocument();
    expect(screen.getByText(/minst 18 år/i)).toBeInTheDocument();
    expect(screen.getByText(/minst 8 siffer/i)).toBeInTheDocument();
    // Skjemaet er IKKE sendt inn
    expect(screen.queryByText(/søknad mottatt/i)).not.toBeInTheDocument();
  });

  it('avviser tom motivasjon og ikke-numerisk alder', async () => {
    renderAt('/pamelding');
    fillForm({ motivation: '   ', age: 'abc' });
    fireEvent.click(screen.getByRole('button', { name: /send søknad/i }));
    expect(await screen.findByText(/alder må være et tall/i)).toBeInTheDocument();
    expect(screen.getByText(/hvorfor du søker/i)).toBeInTheDocument();
  });

  it('gyldig skjema sendes inn og viser bekreftelse med pris-oppsummering', async () => {
    renderAt('/pamelding');
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /send søknad/i }));
    expect(await screen.findByText(/søknad mottatt/i)).toBeInTheDocument();
    // Bekreftelsessiden viser grunnleggerpris, delbetaling og garanti
    expect(screen.getByText(/9 990 kr/)).toBeInTheDocument();
    expect(screen.getByText(/3 × 3 330 kr/)).toBeInTheDocument();
    expect(
      screen.getByText(/jobbgaranti: tilbud innen 90 dager/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/neste steg: en kort telefonsamtale/i)).toBeInTheDocument();
  });
});

describe('Modullås ved dyplenke (V3)', () => {
  it('dyplenke til låst modul viser låst-kort i stedet for leksjonsliste', async () => {
    renderAt('/portal/kurs/dorsalg');
    await waitFor(() => {
      expect(screen.getByText(/låst — fullfør/i)).toBeInTheDocument();
    });
    // Leksjonslisten skal IKKE vises
    expect(screen.queryByText(/10-sekunders døråpning/i)).not.toBeInTheDocument();
  });

  it('dyplenke til leksjon i låst modul viser låst-kort i stedet for innhold', async () => {
    renderAt('/portal/kurs/dorsalg/d2d-psykologi');
    await waitFor(() => {
      expect(screen.getByText(/låst — fullfør/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/quiz — sjekk at det sitter/i)).not.toBeInTheDocument();
  });

  it('åpen modul viser fortsatt innholdet ved dyplenke', async () => {
    renderAt('/portal/kurs/telefonsalg-1');
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /modul 2: telefonsalg i/i }),
      ).toBeInTheDocument();
    });
    expect(screen.getAllByText(/referanse-metoden/i).length).toBeGreaterThan(0);
  });
});
