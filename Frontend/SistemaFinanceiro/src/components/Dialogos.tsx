import { useState, type ReactNode } from "react";
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel,
  MenuItem, Switch, TextField, Typography,
} from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { Opcao } from "./Controles";
import { lerMoeda } from "../utils/formato";

export type ValoresFormulario = Record<string, string | boolean>;

export interface Campo {
  nome: string;
  rotulo: string;
  tipo?: "texto" | "longo" | "selecao" | "data" | "mes" | "moeda" | "chave" | "cor";
  opcoes?: Opcao[] | ((valores: ValoresFormulario) => Opcao[]);
  obrigatorio?: boolean;
  /** Ocupa apenas metade da largura. */
  meia?: boolean;
  visivel?: (valores: ValoresFormulario) => boolean;
  /** Permite valores negativos em campos de moeda. */
  negativo?: boolean;
}

interface FormularioProps {
  titulo: string;
  campos: Campo[];
  inicial: ValoresFormulario;
  /** Recebe os valores com moedas já no formato da API (vazio vira ""). */
  onSalvar: (valores: ValoresFormulario) => Promise<unknown>;
  onFechar: () => void;
  rotuloSalvar?: string;
  /** Mostra um botão "Excluir" no próprio formulário. */
  onExcluir?: () => void;
}

/** Monte apenas quando aberto, para reiniciar os valores. */
export function Formulario({ titulo, campos, inicial, onSalvar, onFechar, rotuloSalvar = "Salvar", onExcluir }: FormularioProps) {
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<ValoresFormulario>({
    defaultValues: inicial,
    shouldUnregister: false,
  });
  const valores = { ...inicial, ...useWatch({ control }) } as ValoresFormulario;
  const [erro, setErro] = useState("");
  const visiveis = campos.filter((campo) => !campo.visivel || campo.visivel(valores));

  const enviar = handleSubmit(async (dados) => {
    setErro("");
    const tratados = { ...dados };
    for (const campo of campos) {
      if (campo.tipo === "moeda") tratados[campo.nome] = lerMoeda(String(dados[campo.nome] ?? "")) ?? "";
    }
    try {
      await onSalvar(tratados);
      onFechar();
    } catch (falha) {
      setErro((falha as Error).message);
    }
  });

  return (
    <Dialog open onClose={onFechar} fullWidth maxWidth="sm">
      <form onSubmit={enviar} noValidate>
        <DialogTitle>{titulo}</DialogTitle>
        <DialogContent>
          {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, pt: 1 }}>
            {visiveis.map((campo) => {
              const opcoes = typeof campo.opcoes === "function" ? campo.opcoes(valores) : campo.opcoes;
              const tipo = campo.tipo ?? "texto";
              return (
                <Box key={campo.nome} sx={{ gridColumn: campo.meia ? "auto" : "1 / -1" }}>
                  <Controller
                    name={campo.nome}
                    control={control}
                    rules={{
                      validate: (valor) => {
                        if (campo.visivel && !campo.visivel(valores)) return true;
                        const texto = String(valor ?? "").trim();
                        if (campo.obrigatorio && !texto) return "Campo obrigatório.";
                        if (tipo === "moeda" && texto) {
                          const lido = lerMoeda(texto);
                          if (lido === null) return "Informe um valor válido, como 1.234,56.";
                          if (!campo.negativo && lido.startsWith("-")) return "O valor não pode ser negativo.";
                        }
                        return true;
                      },
                    }}
                    render={({ field, fieldState }) => tipo === "chave" ? (
                      <FormControlLabel
                        label={campo.rotulo}
                        control={<Switch checked={Boolean(field.value)} onChange={(_, marcado) => field.onChange(marcado)} />}
                      />
                    ) : (
                      <TextField
                        {...field}
                        value={String(field.value ?? "")}
                        inputRef={field.ref}
                        label={campo.rotulo}
                        fullWidth
                        size="small"
                        select={tipo === "selecao"}
                        multiline={tipo === "longo"}
                        minRows={tipo === "longo" ? 2 : undefined}
                        type={tipo === "data" ? "date" : tipo === "mes" ? "month" : tipo === "cor" ? "color" : "text"}
                        placeholder={tipo === "moeda" ? "0,00" : undefined}
                        error={Boolean(fieldState.error)}
                        helperText={fieldState.error?.message}
                        slotProps={{
                          inputLabel: ["data", "mes", "cor", "moeda"].includes(tipo) ? { shrink: true } : undefined,
                          htmlInput: tipo === "moeda" ? { inputMode: "decimal" } : undefined,
                        }}
                      >
                        {opcoes?.map((opcao) => <MenuItem key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</MenuItem>)}
                      </TextField>
                    )}
                  />
                </Box>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          {onExcluir && <Button color="error" onClick={onExcluir} sx={{ mr: "auto" }}>Excluir</Button>}
          <Button onClick={onFechar} color="inherit">Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>{rotuloSalvar}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export function Confirmacao({ titulo, mensagem, onConfirmar, onFechar, rotulo = "Excluir" }: {
  titulo: string; mensagem: string; rotulo?: string;
  onConfirmar: () => Promise<unknown>; onFechar: () => void;
}) {
  const [erro, setErro] = useState("");
  const confirmar = async () => {
    try {
      await onConfirmar();
      onFechar();
    } catch (falha) {
      setErro((falha as Error).message);
    }
  };
  return (
    <Dialog open onClose={onFechar} fullWidth maxWidth="xs">
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>
        {erro ? <Alert severity="error">{erro}</Alert> : <Typography sx={{ fontSize: 15 }}>{mensagem}</Typography>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onFechar} color="inherit">{erro ? "Fechar" : "Cancelar"}</Button>
        {!erro && <Button variant="contained" color="error" onClick={confirmar}>{rotulo}</Button>}
      </DialogActions>
    </Dialog>
  );
}

export function Detalhes({ titulo, itens, onFechar }: {
  titulo: string; itens: { rotulo: string; valor: ReactNode }[]; onFechar: () => void;
}) {
  return (
    <Dialog open onClose={onFechar} fullWidth maxWidth="xs">
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>
        <Box component="dl" sx={{ display: "grid", gap: 2, m: 0 }}>
          {itens.map((item) => (
            <Box key={item.rotulo}>
              <Typography component="dt" sx={{ fontSize: 13, color: "text.secondary" }}>{item.rotulo}</Typography>
              <Typography component="dd" sx={{ fontSize: 15, m: 0 }}>{item.valor}</Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}><Button onClick={onFechar}>Fechar</Button></DialogActions>
    </Dialog>
  );
}
