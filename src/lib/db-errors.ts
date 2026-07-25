/**
 * Traduz erros do Prisma em mensagens que dizem o que está mal,
 * sem nunca expor credenciais, URLs de ligação ou stack traces.
 */

type DbError = { message: string; code: string }

export function describeDbError(error: unknown): DbError {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : ''

  const raw = error instanceof Error ? error.message : ''

  switch (code) {
    case 'P1000':
      return {
        code,
        message:
          "Base de données : identifiants refusés. Vérifiez l'utilisateur et le mot de passe dans DATABASE_URL.",
      }
    case 'P1001':
      return {
        code,
        message:
          "Base de données injoignable. Vérifiez l'hôte et le port dans DATABASE_URL.",
      }
    case 'P1002':
      return { code, message: 'Base de données : délai de connexion dépassé.' }
    case 'P1003':
      return {
        code,
        message:
          "La base de données indiquée dans DATABASE_URL n'existe pas.",
      }
    case 'P1017':
      return { code, message: 'La base de données a fermé la connexion.' }
    case 'P2002':
      return { code, message: 'Cette valeur est déjà utilisée.' }
    case 'P2021':
      return {
        code,
        message:
          "Les tables n'existent pas. Importez le fichier database-mysql.sql dans phpMyAdmin.",
      }
    case 'P2022':
      return {
        code,
        message:
          'Une colonne manque dans la base de données. Réimportez database-mysql.sql.',
      }
  }

  // Cliente Prisma gerado para outro motor ou não gerado de todo
  if (raw.includes('did not initialize')) {
    return {
      code: 'PRISMA_NOT_GENERATED',
      message:
        "Le client de base de données n'a pas été généré. Relancez le déploiement.",
    }
  }

  if (raw.includes('Environment variable not found: DATABASE_URL')) {
    return {
      code: 'NO_DATABASE_URL',
      message: "La variable DATABASE_URL n'est pas définie sur le serveur.",
    }
  }

  return {
    code: code || 'UNKNOWN',
    message: 'Erreur interne du serveur.',
  }
}
