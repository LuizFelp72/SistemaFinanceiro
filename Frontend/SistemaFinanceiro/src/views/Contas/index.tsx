import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Chart from "../../components/Chart";
import { opcaoBarras } from "../../components/Chart/opcoes";
import { Confirmacao, Formulario } from "../../components/Dialogos";
import FormularioTransacao from "../../components/FormularioTransacao";
import { Carregando, CartaoResumo, Pagina, Tendencia } from "../../components/Pagina";
import { Cartao, GradeResumo, TituloCartao } from "../../components/Pagina.styles";
import { useDados } from "../../hooks/useDados";
import { categorias, contas, metodosPagamento, transacoes } from "../../services";
import type { Conta, TipoConta } from "../../services/api/types";
import { cores } from "../../theme/theme";
import { concluidas, saldoEm, variacao } from "../../utils/calculos";
import { limitesDoMes, somarMeses } from "../../utils/datas";
import { centavos, formatarCentavos, formatarMoeda, formatarPercentual, HOJE, moedaParaCampo } from "../../utils/formato";
import AccountCard from "./AccountCard";
import { nomeCurtoConta, TIPOS_CONTA } from "./constants";

const TITULO = "Contas";
const SUBTITULO = "Gerencie suas contas bancárias e cartões";

type Dialogo = { acao: "novo" } | { acao: "editar" | "excluir" | "transferir"; conta: Conta } | null;

export default function Contas() {
  const navigate = useNavigate();
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const { dados, erro, recarregar } = useDados(() => Promise.all([
    contas.listarTodos(), transacoes.listarTodos(), categorias.listarTodos(), metodosPagamento.listarTodos(),
  ]));

  if (!dados) return <Carregando titulo={TITULO} subtitulo={SUBTITULO} erro={erro} repetir={recarregar} />;
  const [lista, lancamentos, listaCategorias, metodos] = dados;
  const mes = HOJE.slice(0, 7);
  const saldoTotal = lista.reduce((total, c) => total + centavos(c.saldo_atual), 0);
  const delta = variacao(saldoTotal, saldoEm(lista, lancamentos, limitesDoMes(somarMeses(mes, -1)).fim));
  const ativas = lista.filter((c) => c.ativo);
  const inativas = lista.length - ativas.length;
  const maior = [...ativas].sort((a, b) => centavos(b.saldo_atual) - centavos(a.saldo_atual))[0];
  const limite = ativas.reduce((total, c) => total + centavos(c.limite_disponivel), 0);
  const cartoes = ativas.filter((c) => c.tipo === "cartao_credito");

  // Saídas do mês: despesas e transferências enviadas por cada conta ativa.
  const saidas = ativas.map((conta) => concluidas(lancamentos)
    .filter((t) => t.conta_id === conta.id && t.tipo !== "receita" && t.data.startsWith(mes))
    .reduce((total, t) => total + centavos(t.valor), 0) / 100);

  const fechar = () => setDialogo(null);
  const editando = dialogo?.acao === "editar" ? dialogo.conta : undefined;

  return (
    <Pagina
      titulo={TITULO}
      subtitulo={SUBTITULO}
      acoes={<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogo({ acao: "novo" })}>Nova conta</Button>}
    >
      <GradeResumo>
        <CartaoResumo titulo="Saldo total" valor={formatarCentavos(saldoTotal)}
          detalhe={delta === null ? undefined : <Tendencia valor={delta}>{formatarPercentual(delta)} vs. mês anterior</Tendencia>} />
        <CartaoResumo titulo="Contas ativas" valor={`${ativas.length} ${ativas.length === 1 ? "conta" : "contas"}`}
          detalhe={`${inativas} ${inativas === 1 ? "inativa" : "inativas"}`} />
        <CartaoResumo titulo="Maior saldo" valor={maior ? formatarMoeda(maior.saldo_atual) : "—"} detalhe={maior?.instituicao || maior?.nome} />
        <CartaoResumo titulo="Limite disponível" valor={formatarCentavos(limite)}
          detalhe={cartoes.length > 1 ? `${cartoes.length} cartões de crédito` : "Cartão de crédito"} />
      </GradeResumo>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" }, gap: "20px" }}>
        {lista.map((conta, indice) => (
          <AccountCard
            key={conta.id}
            conta={conta}
            indice={indice}
            onEditar={() => setDialogo({ acao: "editar", conta })}
            onExcluir={() => setDialogo({ acao: "excluir", conta })}
            onExtrato={() => navigate(`/transacoes?conta=${conta.id}`)}
            onTransferir={() => setDialogo({ acao: "transferir", conta })}
          />
        ))}
        {lista.length === 0 && <Cartao>Nenhuma conta cadastrada.</Cartao>}
      </Box>

      <Cartao sx={{ p: 0 }}>
        <Box sx={{ p: "15px 20px", borderBottom: `1px solid ${cores.bordaSuave}` }}>
          <TituloCartao>Movimentações recentes por conta</TituloCartao>
        </Box>
        <Box sx={{ p: "10px 20px 20px" }}>
          <Chart
            height={200}
            empty={ativas.length === 0}
            label={`Saídas do mês por conta: ${ativas.map((c, i) => `${c.nome}, ${formatarMoeda(saidas[i])}`).join("; ")}.`}
            option={opcaoBarras(ativas.map((c) => nomeCurtoConta(c.nome)), [{ nome: "Saídas", cor: cores.vermelho, valores: saidas }])}
          />
        </Box>
      </Cartao>

      {(dialogo?.acao === "novo" || editando) && (
        <Formulario
          titulo={editando ? "Editar conta" : "Nova conta"}
          onFechar={fechar}
          campos={[
            { nome: "nome", rotulo: "Nome", obrigatorio: true, meia: true },
            { nome: "instituicao", rotulo: "Instituição", meia: true },
            { nome: "tipo", rotulo: "Tipo", tipo: "selecao", obrigatorio: true, meia: true, opcoes: Object.entries(TIPOS_CONTA).map(([valor, rotulo]) => ({ valor, rotulo })) },
            { nome: "saldo_inicial", rotulo: "Saldo inicial (R$)", tipo: "moeda", negativo: true, meia: true },
            { nome: "limite", rotulo: "Limite do cartão (R$)", tipo: "moeda", obrigatorio: true, visivel: (v) => v.tipo === "cartao_credito" },
            { nome: "ativo", rotulo: "Conta ativa", tipo: "chave" },
          ]}
          inicial={{
            nome: editando?.nome ?? "", instituicao: editando?.instituicao ?? "", tipo: editando?.tipo ?? "corrente",
            saldo_inicial: moedaParaCampo(editando?.saldo_inicial), limite: moedaParaCampo(editando?.limite),
            ativo: editando?.ativo ?? true,
          }}
          onSalvar={async (v) => {
            const tipo = String(v.tipo) as TipoConta;
            const dadosConta = {
              nome: String(v.nome).trim(), instituicao: String(v.instituicao).trim() || null, tipo,
              saldo_inicial: String(v.saldo_inicial) || "0.00", moeda: editando?.moeda ?? "BRL",
              limite: tipo === "cartao_credito" ? String(v.limite) : null, ativo: Boolean(v.ativo),
            };
            await (editando ? contas.atualizar(editando.id, dadosConta) : contas.criar(dadosConta));
          }}
        />
      )}
      {dialogo?.acao === "excluir" && (
        <Confirmacao titulo="Excluir conta" mensagem={`Excluir a conta "${dialogo.conta.nome}"?`}
          onConfirmar={() => contas.remover(dialogo.conta.id)} onFechar={fechar} />
      )}
      {dialogo?.acao === "transferir" && (
        <FormularioTransacao
          padrao={{ tipo: "transferencia", conta_id: dialogo.conta.id, descricao: `Transferência de ${dialogo.conta.nome}` }}
          contas={lista} categorias={listaCategorias} metodos={metodos} onFechar={fechar}
        />
      )}
    </Pagina>
  );
}
