import { useState } from "react";
import { Avatar, Box, Button, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { perfil } from "../../services/extras";
import type { Usuario } from "../../services/api/types";
import { formatarData, formatarMoeda, lerMoeda } from "../../utils/formato";
import { nomeCurto } from "../../utils/usuario";
import { CampoPerfil, CartaoFormulario, GradeCampos } from "./fields";
import { lerData, reduzirFoto } from "./utils";

interface Props {
  usuario: Usuario;
  onSalvo: (mensagem?: string) => void;
}

function Pessoais({ usuario, onSalvo }: Props) {
  const [erro, setErro] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { nome: usuario.nome, email: usuario.email, telefone: usuario.telefone ?? "", cpf: usuario.cpf ?? "" },
  });

  const salvar = handleSubmit(async (v) => {
    setErro("");
    try {
      // O CPF nunca é guardado por completo: só a máscara.
      await perfil.atualizar({ nome: v.nome.trim(), email: v.email.trim(), telefone: v.telefone.trim() || null, cpf: v.cpf ? "***.***.***-**" : null });
      onSalvo();
    } catch (falha) {
      setErro((falha as Error).message);
    }
  });

  const trocarFoto = async (arquivo?: File) => {
    if (!arquivo) return;
    setErro("");
    try {
      await perfil.atualizar({ foto: await reduzirFoto(arquivo) });
      onSalvo("Foto atualizada.");
    } catch (falha) {
      setErro((falha as Error).message);
    }
  };

  const campo = (nome: "nome" | "email" | "telefone" | "cpf") => ({
    error: Boolean(errors[nome]), helperText: errors[nome]?.message,
  });

  return (
    <CartaoFormulario titulo="Informações pessoais" erro={erro} enviando={isSubmitting} onSubmit={salvar}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "20px", mb: "26px" }}>
        <Avatar src={usuario.foto ?? undefined} sx={{ width: 80, height: 80, bgcolor: "primary.main", fontSize: 26, fontWeight: 700 }}>
          {usuario.nome.charAt(0)}
        </Avatar>
        <Box>
          <Typography sx={{ fontSize: 17, fontWeight: 600, lineHeight: 1.35 }}>{nomeCurto(usuario.nome)}</Typography>
          <Typography sx={{ fontSize: 15, color: "text.secondary" }}>{usuario.email}</Typography>
          <Button component="label" sx={{ minHeight: 26, p: 0, mt: "2px" }}>
            Alterar foto
            <input hidden type="file" accept="image/*" onChange={(e) => { trocarFoto(e.target.files?.[0]); e.target.value = ""; }} />
          </Button>
        </Box>
      </Box>
      <GradeCampos>
        <CampoPerfil rotulo="Nome completo" {...campo("nome")} {...register("nome", { required: "Nome é obrigatório" })} />
        <CampoPerfil rotulo="E-mail" type="email" {...campo("email")}
          {...register("email", { required: "E-mail é obrigatório", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "E-mail inválido" } })} />
        <CampoPerfil rotulo="Telefone" {...campo("telefone")}
          {...register("telefone", { validate: (v) => !v || v.replace(/\D/g, "").length >= 10 || "Informe DDD e número" })} />
        <CampoPerfil rotulo="CPF" {...campo("cpf")}
          {...register("cpf", { validate: (v) => !v || v === "***.***.***-**" || v.replace(/\D/g, "").length === 11 || "CPF deve ter 11 dígitos" })} />
      </GradeCampos>
    </CartaoFormulario>
  );
}

function Financeiros({ usuario, onSalvo }: Props) {
  const [erro, setErro] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      renda: usuario.renda_mensal ? formatarMoeda(usuario.renda_mensal) : "",
      objetivo: usuario.objetivo_principal ?? "",
      investidor: usuario.perfil_investidor ?? "",
      nascimento: usuario.data_nascimento ? formatarData(usuario.data_nascimento) : "",
    },
  });

  const salvar = handleSubmit(async (v) => {
    setErro("");
    try {
      await perfil.atualizar({
        renda_mensal: v.renda ? lerMoeda(v.renda) : null, objetivo_principal: v.objetivo.trim() || null,
        perfil_investidor: v.investidor.trim() || null, data_nascimento: v.nascimento ? lerData(v.nascimento) : null,
      });
      onSalvo();
    } catch (falha) {
      setErro((falha as Error).message);
    }
  });

  return (
    <CartaoFormulario titulo="Dados financeiros" erro={erro} enviando={isSubmitting} onSubmit={salvar}>
      <GradeCampos>
        <CampoPerfil rotulo="Renda mensal" error={Boolean(errors.renda)} helperText={errors.renda?.message}
          {...register("renda", { validate: (v) => !v || (lerMoeda(v) !== null && !lerMoeda(v)!.startsWith("-")) || "Valor inválido" })} />
        <CampoPerfil rotulo="Objetivo principal" {...register("objetivo")} />
        <CampoPerfil rotulo="Perfil de investidor" {...register("investidor")} />
        <CampoPerfil rotulo="Data de nascimento" placeholder="dd/mm/aaaa" error={Boolean(errors.nascimento)} helperText={errors.nascimento?.message}
          {...register("nascimento", { validate: (v) => !v || lerData(v) !== null || "Use uma data válida (dd/mm/aaaa)" })} />
      </GradeCampos>
    </CartaoFormulario>
  );
}

export default function Profile(props: Props) {
  return (
    <>
      <Pessoais {...props} />
      <Financeiros {...props} />
    </>
  );
}
