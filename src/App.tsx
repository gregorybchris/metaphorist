import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { AboutPage } from "./pages/AboutPage";
import { CuratePage } from "./pages/CuratePage";
import { FrameListPage } from "./pages/FrameListPage";
import { HomePage } from "./pages/HomePage";
import { MetaphorListPage } from "./pages/MetaphorListPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/metaphors" element={<MetaphorListPage />} />
          <Route path="/metaphors/:name" element={<MetaphorListPage />} />

          <Route path="/frames" element={<FrameListPage />} />
          <Route path="/frames/:name" element={<FrameListPage />} />

          <Route path="/curate" element={<CuratePage />} />
          <Route path="/about" element={<AboutPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
