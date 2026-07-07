import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { FamiliesIndexPage } from "./pages/FamiliesIndexPage";
import { FrameFamilyListPage } from "./pages/FrameFamilyListPage";
import { FrameListPage } from "./pages/FrameListPage";
import { MetaphorFamilyListPage } from "./pages/MetaphorFamilyListPage";
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

          <Route path="/families" element={<FamiliesIndexPage />} />

          <Route
            path="/metaphor-families"
            element={<MetaphorFamilyListPage />}
          />
          <Route
            path="/metaphor-families/:name"
            element={<MetaphorFamilyListPage />}
          />

          <Route path="/frame-families" element={<FrameFamilyListPage />} />
          <Route
            path="/frame-families/:name"
            element={<FrameFamilyListPage />}
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
