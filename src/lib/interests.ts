/**
 * O campo `interests` é guardado como JSON no MySQL (que não suporta arrays
 * nativos como o PostgreSQL). Estas funções garantem que o resto da aplicação
 * continua a trabalhar sempre com `string[]`.
 */

/** Converte o valor vindo da base de dados num array de strings seguro. */
export function toInterests(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((i): i is string => typeof i === 'string')
  }
  // Tolerância: se alguma linha antiga tiver sido guardada como string JSON
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.filter((i): i is string => typeof i === 'string')
      }
    } catch {
      // valor inválido — trata como vazio
    }
  }
  return []
}

/** Limpa e limita o array antes de o gravar na base de dados. */
export function sanitizeInterests(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((i): i is string => typeof i === 'string')
    .map((i) => i.trim())
    .filter((i) => i.length > 0 && i.length <= 50)
    .slice(0, 10)
}
