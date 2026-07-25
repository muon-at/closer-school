import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Pamelding from './pages/Pamelding';
import Garanti from './pages/Garanti';
import Vilkar from './pages/Vilkar';
import Stipend from './pages/Stipend';
import LoggInn from './pages/LoggInn';
import Admin from './pages/Admin';
import PortalLayout from './components/PortalLayout';
import Dashbord from './pages/portal/Dashbord';
import Kurs from './pages/portal/Kurs';
import ModulPage from './pages/portal/Modul';
import LeksjonPage from './pages/portal/Leksjon';
import AiCoach from './pages/portal/AiCoach';
import Eksamen from './pages/portal/Eksamen';
import Community from './pages/portal/Community';
import Jobber from './pages/portal/Jobber';
import Leaderboard from './pages/portal/Leaderboard';
import Profil from './pages/portal/Profil';

/** Alle ruter — eksportert separat slik at tester kan bruke MemoryRouter. */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/pamelding" element={<Pamelding />} />
      <Route path="/garanti" element={<Garanti />} />
      <Route path="/vilkar" element={<Vilkar />} />
      {/* Skjult rute — kun for oppfølgings-løpet (direkte URL i e-post/SMS).
          Lenkes bevisst IKKE fra landing, nav, footer eller FAQ. */}
      <Route path="/stipend" element={<Stipend />} />
      <Route path="/logg-inn" element={<LoggInn />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/portal" element={<PortalLayout />}>
        <Route index element={<Dashbord />} />
        <Route path="kurs" element={<Kurs />} />
        <Route path="kurs/:modulSlug" element={<ModulPage />} />
        <Route path="kurs/:modulSlug/:leksjonSlug" element={<LeksjonPage />} />
        <Route path="ai-coach" element={<AiCoach />} />
        <Route path="eksamen" element={<Eksamen />} />
        <Route path="community" element={<Community />} />
        <Route path="jobber" element={<Jobber />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="profil" element={<Profil />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
