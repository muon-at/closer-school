// Renderer alle offentlige ruter + alle portalruter i demo-modus
// og sjekker nøkkeltekst per side.
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';
import { __resetDemoState } from '../lib/data';

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

describe('Offentlige ruter (demo-modus)', () => {
  it('/ viser landingssiden med hero og garanti', () => {
    renderAt('/');
    expect(
      screen.getByRole('heading', { level: 1, name: /fra null til closer/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/norges eneste salgsutdanning med jobbgaranti/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/29 900 kr/)).toBeInTheDocument();
    expect(screen.getByText(/hver krone tilbake/i)).toBeInTheDocument();
  });

  it('/pamelding viser søknadsskjema med angrerett-samtykke', () => {
    renderAt('/pamelding');
    expect(screen.getByText(/søk plass på closerskolen/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fullt navn/i)).toBeInTheDocument();
    expect(screen.getAllByText(/14 dagers angrerett/i).length).toBeGreaterThan(0);
  });

  it('/garanti viser alle seks garantivilkår', () => {
    renderAt('/garanti');
    expect(screen.getByText(/jobbtilbud innen 90 dager — eller hver krone tilbake/i)).toBeInTheDocument();
    expect(screen.getByText(/bestått avsluttende eksamen/i)).toBeInTheDocument();
    expect(screen.getByText(/frist for refusjonskrav/i)).toBeInTheDocument();
  });

  it('/vilkar viser kjøpsvilkår og angrerett', () => {
    renderAt('/vilkar');
    expect(
      screen.getByRole('heading', { name: /kjøpsvilkår og angrerett/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/angrerett \(14 dager\)/i)).toBeInTheDocument();
  });

  it('/logg-inn viser demo-knappen i demo-modus', () => {
    renderAt('/logg-inn');
    expect(
      screen.getByRole('button', { name: /fortsett som demo-student jonas/i }),
    ).toBeInTheDocument();
  });

  it('/admin viser adminpanelet med produksjonsmerknad', async () => {
    renderAt('/admin');
    expect(screen.getByText(/admin — krever admin-rolle i produksjon/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/sara m\./i)).toBeInTheDocument();
    });
  });
});

describe('Portalruter (demo-modus)', () => {
  it('/portal viser dashbordet med fremdrift', async () => {
    renderAt('/portal');
    await waitFor(() => {
      expect(screen.getByText(/velkommen tilbake, jonas/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/av 25/i)).toBeInTheDocument();
    expect(screen.getByText(/neste leksjon/i)).toBeInTheDocument();
  });

  it('/portal/kurs viser modulliste med lås-logikk', async () => {
    renderAt('/portal/kurs');
    await waitFor(() => {
      expect(screen.getByText(/kursmoduler/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/modul 1: fundamentet/i)).toBeInTheDocument();
    expect(screen.getByText(/modul 6: high ticket & karriere/i)).toBeInTheDocument();
    // Modul 4 krever 9 godkjente AI-samtaler — demo-Jonas har 7 → låst
    // (Designsystemet bruker LÅST-tag med lock-ikon i stedet for emoji)
    expect(screen.getAllByText(/^låst$/i).length).toBeGreaterThan(0);
  });

  it('/portal/kurs/fundamentet viser leksjonsliste', async () => {
    renderAt('/portal/kurs/fundamentet');
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /modul 1: fundamentet/i }),
      ).toBeInTheDocument();
    });
    expect(screen.getAllByText(/hvorfor salg er verdens beste startjobb/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/kunsten å lytte/i).length).toBeGreaterThan(0);
  });

  it('/portal/kurs/fundamentet/hvorfor-salg viser leksjon med video-placeholder og quiz', async () => {
    renderAt('/portal/kurs/fundamentet/hvorfor-salg');
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /hvorfor salg er verdens beste startjobb/i }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/video spilles inn — manus klart/i)).toBeInTheDocument();
    expect(screen.getByText(/quiz — sjekk at det sitter/i)).toBeInTheDocument();
  });

  it('/portal/ai-coach viser persona-velgeren', async () => {
    renderAt('/portal/ai-coach');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /velg kunde/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/kari \(54\)/i)).toBeInTheDocument();
    expect(screen.getByText(/pris-presseren/i)).toBeInTheDocument();
    expect(screen.getByText(/vanskelighetsgrad:/i)).toBeInTheDocument();
  });

  it('/portal/eksamen viser tre eksamenssteg', async () => {
    renderAt('/portal/eksamen');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^teorieksamen$/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: /ai-eksamenssamtale/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ekte kundesamtale med sensor/i })).toBeInTheDocument();
  });

  it('/portal/community viser feed og Wins Wednesday', async () => {
    renderAt('/portal/community');
    await waitFor(() => {
      expect(screen.getByText(/wins wednesday/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/første salg på ekte/i)).toBeInTheDocument();
  });

  it('/portal/jobber viser jobbtavla', async () => {
    renderAt('/portal/jobber');
    await waitFor(() => {
      expect(screen.getByText(/jobbtavle/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/tm-selger — allente-partner/i)).toBeInTheDocument();
    expect(screen.getByText(/remote closer — high ticket/i)).toBeInTheDocument();
  });

  it('/portal/leaderboard fremhever topp 3 med premie', async () => {
    renderAt('/portal/leaderboard');
    await waitFor(() => {
      expect(screen.getAllByText(/1:1/).length).toBeGreaterThan(0);
    });
    expect(screen.getByText(/sara m\./i)).toBeInTheDocument();
  });

  it('/portal/profil viser garantistatus', async () => {
    renderAt('/portal/profil');
    await waitFor(() => {
      expect(screen.getByText(/garantistatus/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/sertifikatstatus/i)).toBeInTheDocument();
  });
});
