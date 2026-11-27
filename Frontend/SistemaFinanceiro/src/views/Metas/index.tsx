import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { AcoesLinha, Progresso, Selo } from "../../components/Controles";
import { Confirmacao, Formulario } from "../../components/Dialogos";
import { Carregando, CartaoResumo, Pagina, Tendencia } from "../../components/Pagina";
import { Cartao, GradeResumo } from "../../components/Pagina.styles";
import { useDados } from "../../hooks/useDados";
import { metas } from "../../services";
import type { Meta, StatusMeta } from "../../services/api/types";
import { cores } from "../../theme/theme";
import { centavos, formatarCentavos, formatarMoeda, formatarPercentual, HOJE, mesAno, moedaParaCampo } from "../../utils/formato";

const TITULO = "Metas";
const SUBTITULO = "Acompanhe seus objetivos financeiros";

type Dialogo = { acao: "novo" } | { acao: "editar" | "excluir"; meta: Meta } | null;

function Prazo({ meta }: { meta: Meta }) {
  if (meta.status === "concluida") {
    return <Selo cor={cores.verde} fundo={cores.verdeSuave}><CheckCircleOutlinedIcon sx={{ fontSize: 14 }} />Concluída</Selo>;
  }
  if (meta.status === "cancelada") return <Selo cor={cores.textoSecundario} fundo={cores.bordaSuave}>Cancelada</Selo>;
  return <Selo cor={cores.primaria} fundo={cores.primariaSuave}><AccessTimeRoundedIcon sx={{ fontSize: 14 }} />{mesAno(meta.data_limite)}</Selo>;
}

export default function Metas() {
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const { dados: lista, erro, recarregar } = useDados(() => metas.listarTodos());

  if (!lista) return <Carregando titulo={TITULO} subtitulo={SUBTITULO} erro={erro} repetir={recarregar} />;
  // Metas canceladas não entram nos valores.
  const validas = lista.filter((m) => m.status !== "cancelada");
  const objetivo = validas.reduce((total, m) => total + centavos(m.valor_objetivo), 0);
  const acumulado = validas.reduce((total, m) => total + centavos(m.valor_atual), 0);
  const quantidade = (n: number) => `${n} ${n === 1 ? "meta" : "metas"}`;
  const fechar = () => setDialogo(null);
  const editando = dialogo?.acao === "editar" ? dialogo.meta : undefined;

  return (
    <Pagina
      titulo={TITULO}
      subtitulo={SUBTITULO}
      acoes={<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogo({ acao: "novo" })}>Nova meta</Button>}
    >
      <GradeResumo>
        <CartaoResumo titulo="Total de metas" valor={quantidade(lista.length)}
          detalhe={<Tendencia valor={1}>{lista.filter((m) => m.status === "concluida").length} concluídas</Tendencia>} />
        <CartaoResumo titulo="Em andamento" valor={quantidade(lista.filter((m) => m.status === "ativa").length)} detalhe="Acompanhe o progresso" />
        <CartaoResumo titulo="Valor total das metas" valor={formatarCentavos(objetivo)} />
        <CartaoResumo titulo="Valor acumulado" valor={formatarCentavos(acumulado)}
          detalhe={<Tendencia valor={1}>{formatarPercentual(objetivo ? (acumulado / objetivo) * 100 : 0)} do total</Tendencia>} />
      </GradeResumo>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" }, gap: "22px" }}>
        {lista.map((meta) => {
          const percentual = (centavos(meta.valor_atual) / centavos(meta.valor_objetivo)) * 100;
          const falta = centavos(meta.valor_objetivo) - centavos(meta.valor_atual);
          const cor = meta.cor ?? cores.primaria;
          return (
            <Cartao key={meta.id} sx={{ minHeight: 163, opacity: meta.status === "cancelada" ? 0.6 : 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <Box component="span" aria-hidden sx={{ fontSize: 26, width: 31 }}>{meta.icone}</Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap component="h2" sx={{ fontSize: 17, fontWeight: 600, lineHeight: 1.35 }}>{meta.nome}</Typography>
                  <Typography noWrap sx={{ fontSize: 14, color: "text.secondary" }}>{meta.categoria ?? "—"}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, alignSelf: "flex-start", mt: "-2px" }}>
                  <Prazo meta={meta} />
                  <AcoesLinha nome={meta.nome} onEditar={() => setDialogo({ acao: "editar", meta })} onExcluir={() => setDialogo({ acao: "excluir", meta })} />
                </Box>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 15, mt: "13px", mb: "4px" }}>
                <Box component="span" sx={{ color: "text.secondary" }}>{formatarMoeda(meta.valor_atual)} de {formatarMoeda(meta.valor_objetivo)}</Box>
                <Box component="span" sx={{ color: cor, fontWeight: 600 }}>{formatarPercentual(percentual, 0)}</Box>
              </Box>
              <Progresso percentual={percentual} cor={cor} rotulo={`Progresso de ${meta.nome}`} />
              {falta > 0 && <Typography sx={{ fontSize: 13, color: "text.secondary", mt: "8px" }}>Faltam {formatarCentavos(falta)} para a meta</Typography>}
            </Cartao>
          );
        })}
        {lista.length === 0 && <Cartao>Nenhuma meta cadastrada.</Cartao>}
      </Box>

      {(dialogo?.acao === "novo" || editando) && (
        <Formulario
          titulo={editando ? "Editar meta" : "Nova meta"}
          onFechar={fechar}
          campos={[
            { nome: "nome", rotulo: "Nome", obrigatorio: true, meia: true },
            { nome: "categoria", rotulo: "Categoria", meia: true },
            { nome: "valor_objetivo", rotulo: "Valor da meta (R$)", tipo: "moeda", obrigatorio: true, meia: true },
            { nome: "valor_atual", rotulo: "Valor acumulado (R$)", tipo: "moeda", meia: true },
            { nome: "data_inicio", rotulo: "Início", tipo: "data", obrigatorio: true, meia: true },
            { nome: "data_limite", rotulo: "Prazo", tipo: "data", obrigatorio: true, meia: true },
            { nome: "status", rotulo: "Status", tipo: "selecao", obrigatorio: true, opcoes: [{ valor: "ativa", rotulo: "Em andamento" }, { valor: "concluida", rotulo: "Concluída" }, { valor: "cancelada", rotulo: "Cancelada" }] },
            { nome: "icone", rotulo: "Ícone (emoji)", meia: true },
            { nome: "cor", rotulo: "Cor", tipo: "cor", meia: true },
          ]}
          inicial={{
            nome: editando?.nome ?? "", categoria: editando?.categoria ?? "",
            valor_objetivo: moedaParaCampo(editando?.valor_objetivo), valor_atual: moedaParaCampo(editando?.valor_atual),
            data_inicio: editando?.data_inicio ?? HOJE, data_limite: editando?.data_limite ?? "",
            status: editando?.status ?? "ativa", icone: editando?.icone ?? "🎯", cor: (editando?.cor ?? cores.primaria).toLowerCase(),
          }}
          onSalvar={async (v) => {
            const dadosMeta = {
              nome: String(v.nome).trim(), categoria: String(v.categoria).trim() || null,
              valor_objetivo: String(v.valor_objetivo), valor_atual: String(v.valor_atual) || "0.00",
              data_inicio: String(v.data_inicio), data_limite: String(v.data_limite),
              status: String(v.status) as StatusMeta, icone: String(v.icone).trim() || null, cor: String(v.cor),
            };
            await (editando ? metas.atualizar(editando.id, dadosMeta) : metas.criar(dadosMeta));
          }}
        />
      )}
      {dialogo?.acao === "excluir" && (
        <Confirmacao titulo="Excluir meta" mensagem={`Excluir a meta "${dialogo.meta.nome}"?`}
          onConfirmar={() => metas.remover(dialogo.meta.id)} onFechar={fechar} />
      )}
    </Pagina>
  );
}
