/** Seções sem wireframe: formulários simples no mesmo estilo. */
import { useState } from "react";
import { Box, FormControlLabel, MenuItem, Switch, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Cartao, TituloCartao } from "../../components/Pagina.styles";
import { perfil, preferencias } from "../../services/extras";
import type { Preferencias } from "../../services/api/types";
import { CampoPerfil, CartaoFormulario, GradeCampos } from "./fields";

type Salvo = (mensagem?: string) => void;

export function Seguranca({ onSalvo }: { onSalvo: Salvo }) {
  const [erro, setErro] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { atual: "", nova: "", confirmacao: "" },
  });

  const salvar = handleSubmit(async (v) => {
    setErro("");
    try {
      await perfil.alterarSenha(v.atual, v.nova);
      reset();
      onSalvo("Senha alterada.");
    } catch (falha) {
      setErro((falha as Error).message);
    }
  });

  return (
    <CartaoFormulario titulo="Alterar senha" erro={erro} enviando={isSubmitting} onSubmit={salvar} botao="Alterar senha">
      <Box sx={{ display: "grid", gap: "20px", maxWidth: 480 }}>
        <CampoPerfil rotulo="Senha atual" type="password" autoComplete="current-password" error={Boolean(errors.atual)} helperText={errors.atual?.message}
          {...register("atual", { required: "Informe a senha atual" })} />
        <CampoPerfil rotulo="Nova senha" type="password" autoComplete="new-password" error={Boolean(errors.nova)} helperText={errors.nova?.message}
          {...register("nova", { required: "Informe a nova senha", minLength: { value: 6, message: "Mínimo de 6 caracteres" } })} />
        <CampoPerfil rotulo="Confirmar nova senha" type="password" autoComplete="new-password" error={Boolean(errors.confirmacao)} helperText={errors.confirmacao?.message}
          {...register("confirmacao", { validate: (v, todos) => v === todos.nova || "As senhas não conferem" })} />
      </Box>
    </CartaoFormulario>
  );
}

export function Notificacoes({ opcoes, onSalvo }: { opcoes: Preferencias; onSalvo: Salvo }) {
  const { control, handleSubmit } = useForm({ defaultValues: opcoes });
  const salvar = handleSubmit(async (v) => {
    await preferencias.atualizar({ notificar_orcamentos: v.notificar_orcamentos, notificar_metas: v.notificar_metas });
    onSalvo();
  });
  const itens = [
    { nome: "notificar_orcamentos", rotulo: "Avisar quando um orçamento estiver perto do limite" },
    { nome: "notificar_metas", rotulo: "Avisar quando uma meta estiver perto do prazo" },
  ] as const;

  return (
    <CartaoFormulario titulo="Notificações" onSubmit={salvar}>
      <Box sx={{ display: "grid" }}>
        {itens.map((item) => (
          <Controller key={item.nome} name={item.nome} control={control} render={({ field }) => (
            <FormControlLabel label={item.rotulo} control={<Switch checked={field.value} onChange={(_, v) => field.onChange(v)} />} />
          )} />
        ))}
      </Box>
    </CartaoFormulario>
  );
}

export function Aparencia() {
  return (
    <Cartao sx={{ p: "25px" }}>
      <TituloCartao style={{ marginBottom: 8 }}>Aparência</TituloCartao>
      <Typography sx={{ fontSize: 15, color: "text.secondary" }}>O Nuvra usa o tema claro. Outros temas ainda não estão disponíveis.</Typography>
    </Cartao>
  );
}

export function Moeda({ opcoes, onSalvo }: { opcoes: Preferencias; onSalvo: Salvo }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { moeda: opcoes.moeda, regiao: opcoes.regiao, meta_poupanca: opcoes.meta_poupanca },
  });
  const salvar = handleSubmit(async (v) => {
    await preferencias.atualizar({ ...v, meta_poupanca: Number(v.meta_poupanca) });
    onSalvo();
  });

  return (
    <CartaoFormulario titulo="Moeda e Região" onSubmit={salvar}>
      <GradeCampos>
        <CampoPerfil rotulo="Moeda" select defaultValue={opcoes.moeda} {...register("moeda")}>
          <MenuItem value="BRL">Real (BRL)</MenuItem>
        </CampoPerfil>
        <CampoPerfil rotulo="Região" select defaultValue={opcoes.regiao} {...register("regiao")}>
          <MenuItem value="pt-BR">Brasil</MenuItem>
        </CampoPerfil>
        <CampoPerfil rotulo="Meta de poupança (%)" type="number" error={Boolean(errors.meta_poupanca)} helperText={errors.meta_poupanca?.message}
          {...register("meta_poupanca", { min: { value: 0, message: "Mínimo 0" }, max: { value: 100, message: "Máximo 100" }, required: "Informe a meta" })} />
      </GradeCampos>
    </CartaoFormulario>
  );
}
