import { useCallback, useEffect, useState } from "react";
import { assinar } from "../services/mock/db";

/**
 * Carrega dados assíncronos e recarrega quando eles mudam.
 * `chave` identifica os parâmetros da consulta (filtros, página...).
 */
export function useDados<T>(carregar: () => Promise<T>, chave = "") {
  const [estado, setEstado] = useState<{ dados?: T; erro?: string }>({});
  const [versao, setVersao] = useState(0);
  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  useEffect(() => assinar(recarregar), [recarregar]);

  useEffect(() => {
    let atual = true; // ignora respostas de consultas antigas
    carregar().then(
      (dados) => { if (atual) setEstado({ dados }); },
      (erro: Error) => { if (atual) setEstado({ erro: erro.message }); },
    );
    return () => { atual = false; };
    // `carregar` muda a cada renderização; quem controla a recarga é a chave.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, versao]);

  return { ...estado, recarregar };
}
