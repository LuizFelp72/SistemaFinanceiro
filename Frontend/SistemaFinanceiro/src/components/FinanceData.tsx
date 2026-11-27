import { useEffect, useState, type ReactNode } from "react";
import { Alert, Button, LinearProgress } from "@mui/material";
import { emptyLedger, loadResource, type Ledger, type Resource } from "../services/finance";

export default function FinanceData({ resources, children }: { resources: string; children(db: Ledger, reload: () => void): ReactNode }) {
  const [db, setDb] = useState<Ledger | null>(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  function reload() { setVersion(v => v + 1); setError(""); }
  useEffect(() => {
    const controller = new AbortController();
    const data = emptyLedger();
    Promise.all(resources.split(" ").map(async name => {
      const resource = name as Resource;
      data[resource] = await loadResource(resource, controller.signal);
    })).then(() => { if (!controller.signal.aborted) setDb(data); })
      .catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [resources, version]);
  if (error) return <Alert severity="error" action={<Button onClick={reload}>Tentar novamente</Button>}>{error}</Alert>;
  if (!db) return <LinearProgress aria-label="Carregando dados financeiros" />;
  return <>{children(db, reload)}</>;
}
