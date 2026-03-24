import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import HomePage from './pages/HomePage';
import PracticePage from './pages/PracticePage';
import ListsPage from './pages/ListsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lists" element={<ListsPage />} />
          <Route path="/practice" element={<PracticePage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
