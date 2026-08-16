/**
 * fetch() résilient aux échecs réseau transitoires.
 *
 * Sur certains hébergements (Hostinger inclus), le processus Node peut
 * mettre un instant à répondre après une période d'inactivité — la toute
 * première requête échoue alors au niveau réseau (le navigateur ne reçoit
 * aucune réponse du tout, pas même une erreur HTTP), tandis que la requête
 * suivante, immédiatement après, aboutit normalement. Sur Safari, cet échec
 * se manifeste par l'exception "Load failed".
 *
 * Cette fonction retente une seule fois, après un court délai, uniquement
 * quand fetch() lève une exception (échec réseau réel) — jamais quand le
 * serveur a répondu, même avec un code d'erreur : ces réponses-là sont
 * gérées normalement par l'appelant, pas ici.
 */
export async function fetchResilient(url: string, options?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (premiereErreur) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    try {
      return await fetch(url, options);
    } catch (deuxiemeErreur) {
      // Les deux tentatives ont échoué : on propage l'erreur d'origine,
      // plus représentative du vrai problème.
      throw premiereErreur;
    }
  }
}
