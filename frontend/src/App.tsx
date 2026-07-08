import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { FrameListPage } from "./pages/FrameListPage";
import { MetaphorListPage } from "./pages/MetaphorListPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/metaphors" replace />} />

          <Route path="/metaphors" element={<MetaphorListPage />} />
          <Route path="/metaphors/:name" element={<MetaphorListPage />} />

          <Route path="/frames" element={<FrameListPage />} />
          <Route path="/frames/:name" element={<FrameListPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
