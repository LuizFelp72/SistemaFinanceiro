import { useEffect, useState, type ReactNode } from "react";
import { Alert, Box, Button, Skeleton, Stack } from "@mui/material";
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
  if (!db) return (
    <Stack spacing={3} role="status" aria-label="Carregando dados financeiros" aria-busy="true">
      <Box aria-hidden="true">
        <Skeleton width={190} height={38} />
        <Skeleton width={270} height={24} sx={{ maxWidth: "100%" }} />
      </Box>
      <Box aria-hidden="true" sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
        {[0, 1, 2].map(item => <Skeleton key={item} variant="rounded" height={110} />)}
      </Box>
      <Skeleton aria-hidden="true" variant="rounded" height={260} />
    </Stack>
  );
  return <>{children(db, reload)}</>;
}
