import { AppLayout } from "@/components/layout";
import { UnlockGate } from "@/components/unlock-gate";
import { VaultProvider } from "@/db/vault";
import { ChartsPage } from "@/pages/charts";
import { DocsPage } from "@/pages/docs";
import { HomePage } from "@/pages/home";
import { ImportPage } from "@/pages/import";
import { SettingsPage } from "@/pages/settings";
import { TransactionsPage } from "@/pages/transactions";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <VaultProvider>
      <UnlockGate>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="import" element={<ImportPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="charts" element={<ChartsPage />} />
              <Route path="docs" element={<DocsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UnlockGate>
    </VaultProvider>
  );
}
