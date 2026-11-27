import ProfileForm from "./ProfileForm";
import { useState } from "react";
import { Avatar, Box, Button, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/session";
import { PageHeader } from "../../components/FinancePage";
export default function Configuracoes() {
  const {user,logout}=useAuth();
  const [tab,setTab]=useState("perfil");
  return <Stack spacing={3}><PageHeader title="Configurações" subtitle="Gerencie seu perfil e suas formas de pagamento"/>
    <Box sx={{display:"grid",alignItems:"start",gap:2,gridTemplateColumns:{xs:"1fr",md:"220px minmax(0,1fr)"}}}>
      <Paper sx={{p:1}}><Tabs orientation="vertical" aria-label="Configurações da conta" value={tab} onChange={(_,v)=>setTab(v)}>
        <Tab value="perfil" label="Perfil"/><Tab value="pagamentos" label="Pagamentos"/><Tab value="seguranca" label="Segurança"/>
      </Tabs></Paper>
      <Paper role="tabpanel" sx={{p:{xs:2,md:3}}}>{tab==="perfil"?<Stack spacing={2.5}>
        <Typography component="h2" variant="h6">Informações pessoais</Typography><Stack direction="row" spacing={2} sx={{alignItems:"center"}}><Avatar sx={{width:56,height:56,bgcolor:"primary.dark"}}>{user?.nome.slice(0,1)}</Avatar><Typography variant="h6">{user?.nome}</Typography></Stack>
        <ProfileForm />
      </Stack>:tab==="pagamentos"?<Stack spacing={2}><Typography component="h2" variant="h6">Métodos de pagamento</Typography><Typography>Escolha os métodos disponíveis ao registrar uma transação.</Typography><Button component={Link} to="/metodos-pagamento" variant="outlined" sx={{alignSelf:"start"}}>Gerenciar métodos</Button></Stack>:
      <Stack spacing={2}><Typography component="h2" variant="h6">Sessão atual</Typography><Typography>Conectado como {user?.email}.</Typography><ProfileForm password /><Button color="error" variant="outlined" onClick={logout} sx={{alignSelf:"start"}}>Encerrar sessão</Button></Stack>}</Paper>
    </Box></Stack>;
}
