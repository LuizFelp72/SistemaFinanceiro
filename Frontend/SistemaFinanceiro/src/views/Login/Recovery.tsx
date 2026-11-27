import { useState, type FormEvent } from "react";
import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../services/api";
export default function Recovery() {
 const [params]=useSearchParams(); const token=params.get("token");
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[success,setSuccess]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;const form=new FormData(e.currentTarget);
  setError("");setBusy(true);
  try{
   if(token && form.get("senha")!==form.get("confirmacao"))throw new Error("As senhas não coincidem.");
   await api(token?"/auth/reset-password":"/auth/forgot-password",{method:"POST",body:JSON.stringify(token?{token,nova_senha:form.get("senha")}:{email:form.get("email")})},false);
   setSuccess(token?"Senha redefinida. Faça login com a nova senha.":"Se o e-mail estiver cadastrado, você receberá as instruções.");
  }catch(e){setError(e instanceof Error?e.message:"Não foi possível continuar.");}finally{setBusy(false);}
 }
 return <Paper sx={{maxWidth:440,mx:"auto",my:6,p:3}}><Stack component="form" onSubmit={submit} spacing={2}>
 <Typography component="h1" variant="h5">Recuperar acesso</Typography>
 {error&&<Alert severity="error">{error}</Alert>}{success&&<Alert severity="success">{success}</Alert>}
 {!success&&<>{token?<><TextField name="senha" label="Nova senha" type="password" autoComplete="new-password" required slotProps={{htmlInput:{minLength:8}}}/><TextField name="confirmacao" label="Confirmar senha" type="password" autoComplete="new-password" required/></>:<TextField name="email" label="E-mail" type="email" autoComplete="email" required/>}<Button disabled={busy} type="submit" variant="contained">{busy?"Aguarde…":token?"Redefinir senha":"Enviar instruções"}</Button></>}
 <Button component={Link} to="/login">Voltar ao login</Button></Stack></Paper>;
}
