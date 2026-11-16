import { bensMock } from "./bens.mock";
import type { Bem } from "./bens.types";

export function listarBens(): Bem[] {
  return bensMock.map((bem) => ({ ...bem }));
}
