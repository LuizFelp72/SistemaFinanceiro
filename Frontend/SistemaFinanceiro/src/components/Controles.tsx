import { Box, Button, IconButton, MenuItem, Select, Table, TableContainer, Tooltip, styled } from "@mui/material";
import type { ReactNode } from "react";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { cores } from "../theme/theme";

export interface Opcao<T extends string = string> {
  valor: T;
  rotulo: string;
}

/** Abas em formato de pílula. */
export function Abas<T extends string>({ opcoes, valor, onChange, rotulo }: {
  opcoes: Opcao<T>[]; valor: T; onChange: (valor: T) => void; rotulo: string;
}) {
  return (
    <Box role="group" aria-label={rotulo} sx={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
      {opcoes.map((opcao) => {
        const ativa = opcao.valor === valor;
        return (
          <Button
            key={opcao.valor}
            aria-pressed={ativa}
            variant={ativa ? "contained" : "text"}
            onClick={() => onChange(opcao.valor)}
            sx={{ minHeight: 35, minWidth: 0, px: "15px", py: 0, color: ativa ? cores.branco : cores.textoSecundario }}
          >
            {opcao.rotulo}
          </Button>
        );
      })}
    </Box>
  );
}

/** Seletor compacto usado nas barras de filtro. */
export function Filtro({ opcoes, valor, onChange, rotulo }: {
  opcoes: Opcao[]; valor: string; onChange: (valor: string) => void; rotulo: string;
}) {
  return (
    <Select
      size="small"
      value={valor}
      displayEmpty
      onChange={(evento) => onChange(evento.target.value)}
      IconComponent={KeyboardArrowDownRoundedIcon}
      inputProps={{ "aria-label": rotulo }}
      sx={{ height: 38, bgcolor: cores.branco, "& .MuiSelect-icon": { fontSize: 18, top: "calc(50% - 9px)" } }}
    >
      {opcoes.map((opcao) => <MenuItem key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</MenuItem>)}
    </Select>
  );
}

/** Etiqueta arredondada com fundo suave na cor informada. */
export function Selo({ cor, fundo, children }: { cor: string; fundo?: string; children: ReactNode }) {
  return (
    <Box
      component="span"
      sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: "10px", height: 22, borderRadius: 999, fontSize: 13, whiteSpace: "nowrap", color: cor, bgcolor: fundo ?? `${cor}1A` }}
    >
      {children}
    </Box>
  );
}

export function AcoesLinha({ nome, onVer, onEditar, onExcluir }: {
  nome: string; onVer?: () => void; onEditar: () => void; onExcluir: () => void;
}) {
  const acoes = [
    { titulo: "Ver detalhes", Icone: VisibilityOutlinedIcon, executar: onVer },
    { titulo: "Editar", Icone: EditOutlinedIcon, executar: onEditar },
    { titulo: "Excluir", Icone: DeleteOutlineOutlinedIcon, executar: onExcluir },
  ];
  return (
    <Box className="nao-imprimir" sx={{ display: "inline-flex", gap: "1px" }}>
      {acoes.filter((acao) => acao.executar).map(({ titulo, Icone, executar }) => (
        <Tooltip key={titulo} title={titulo}>
          <IconButton size="small" aria-label={`${titulo}: ${nome}`} onClick={executar} sx={{ p: "4px", color: cores.textoFraco }}>
            <Icone sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );
}

export function Progresso({ percentual, cor, rotulo, altura = 10 }: {
  percentual: number; cor: string; rotulo: string; altura?: number;
}) {
  const largura = Math.min(100, Math.max(0, percentual));
  return (
    <Box
      role="progressbar"
      aria-label={rotulo}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(largura)}
      sx={{ height: altura, borderRadius: 999, bgcolor: cores.bordaSuave, overflow: "hidden" }}
    >
      <Box sx={{ width: `${largura}%`, height: "100%", borderRadius: 999, bgcolor: cor }} />
    </Box>
  );
}

const TabelaBase = styled(Table)({
  "& th, & td": { paddingInline: 20, whiteSpace: "nowrap" },
  "& th": { height: 52, paddingBlock: 0, fontSize: 14.5, fontWeight: 600, color: cores.textoSecundario, backgroundColor: cores.fundoTabela },
  "& td": { height: 51, paddingBlock: 6 },
});

/** Tabela com rolagem horizontal em telas estreitas. */
export function Tabela({ rotulo, larguraMinima = 760, children }: {
  rotulo: string; larguraMinima?: number; children: ReactNode;
}) {
  return (
    <TableContainer>
      <TabelaBase aria-label={rotulo} sx={{ minWidth: larguraMinima }}>{children}</TabelaBase>
    </TableContainer>
  );
}
