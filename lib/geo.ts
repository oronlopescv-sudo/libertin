export interface CityConfig {
  name: string;
  country: string;
  flag: string;
  lat: number;
  lng: number;
}

export const CITIES: Record<string, CityConfig> = {
  // ============================================================
  // FRANCE — principais cidades (metros + préfeituras + balnéarios)
  // ============================================================
  Paris: { name: 'Paris', country: 'France', flag: '🇫🇷', lat: 48.8566, lng: 2.3522 },
  Marseille: { name: 'Marseille', country: 'France', flag: '🇫🇷', lat: 43.2965, lng: 5.3698 },
  Lyon: { name: 'Lyon', country: 'France', flag: '🇫🇷', lat: 45.7640, lng: 4.8357 },
  Toulouse: { name: 'Toulouse', country: 'France', flag: '🇫🇷', lat: 43.6047, lng: 1.4442 },
  Nice: { name: 'Nice', country: 'France', flag: '🇫🇷', lat: 43.7102, lng: 7.2620 },
  Nantes: { name: 'Nantes', country: 'France', flag: '🇫🇷', lat: 47.2181, lng: -1.5536 },
  Montpellier: { name: 'Montpellier', country: 'France', flag: '🇫🇷', lat: 43.6108, lng: 3.8767 },
  Strasbourg: { name: 'Strasbourg', country: 'France', flag: '🇫🇷', lat: 48.5734, lng: 7.7521 },
  Bordeaux: { name: 'Bordeaux', country: 'France', flag: '🇫🇷', lat: 44.8378, lng: -0.5792 },
  Lille: { name: 'Lille', country: 'France', flag: '🇫🇷', lat: 50.6292, lng: 3.0573 },
  Rennes: { name: 'Rennes', country: 'France', flag: '🇫🇷', lat: 48.1173, lng: -1.6778 },
  Reims: { name: 'Reims', country: 'France', flag: '🇫🇷', lat: 49.2583, lng: 4.0317 },
  'Le Havre': { name: 'Le Havre', country: 'France', flag: '🇫🇷', lat: 49.4944, lng: 0.1079 },
  'Saint-Étienne': { name: 'Saint-Étienne', country: 'France', flag: '🇫🇷', lat: 45.4397, lng: 4.3872 },
  Toulon: { name: 'Toulon', country: 'France', flag: '🇫🇷', lat: 43.1242, lng: 5.9280 },
  Grenoble: { name: 'Grenoble', country: 'France', flag: '🇫🇷', lat: 45.1885, lng: 5.7245 },
  Dijon: { name: 'Dijon', country: 'France', flag: '🇫🇷', lat: 47.3220, lng: 5.0415 },
  Angers: { name: 'Angers', country: 'France', flag: '🇫🇷', lat: 47.4784, lng: -0.5632 },
  Nîmes: { name: 'Nîmes', country: 'France', flag: '🇫🇷', lat: 43.8367, lng: 4.3601 },
  Villeurbanne: { name: 'Villeurbanne', country: 'France', flag: '🇫🇷', lat: 45.7719, lng: 4.8768 },
  'Le Mans': { name: 'Le Mans', country: 'France', flag: '🇫🇷', lat: 48.0077, lng: 0.1996 },
  'Aix-en-Provence': { name: 'Aix-en-Provence', country: 'France', flag: '🇫🇷', lat: 43.5297, lng: 5.4474 },
  Brest: { name: 'Brest', country: 'France', flag: '🇫🇷', lat: 48.3904, lng: -4.4861 },
  Tours: { name: 'Tours', country: 'France', flag: '🇫🇷', lat: 47.3941, lng: 0.6843 },
  Amiens: { name: 'Amiens', country: 'France', flag: '🇫🇷', lat: 49.8940, lng: 2.2958 },
  Limoges: { name: 'Limoges', country: 'France', flag: '🇫🇷', lat: 45.8336, lng: 1.2625 },
  Annecy: { name: 'Annecy', country: 'France', flag: '🇫🇷', lat: 45.8992, lng: 6.1294 },
  Perpignan: { name: 'Perpignan', country: 'France', flag: '🇫🇷', lat: 42.6886, lng: 2.8949 },
  'Boulogne-Billancourt': { name: 'Boulogne-Billancourt', country: 'France', flag: '🇫🇷', lat: 48.8397, lng: 2.2397 },
  Metz: { name: 'Metz', country: 'France', flag: '🇫🇷', lat: 49.1193, lng: 6.1727 },
  Besançon: { name: 'Besançon', country: 'France', flag: '🇫🇷', lat: 47.2378, lng: 6.0241 },
  Orléans: { name: 'Orléans', country: 'France', flag: '🇫🇷', lat: 47.9029, lng: 1.9093 },
  Rouen: { name: 'Rouen', country: 'France', flag: '🇫🇷', lat: 49.4432, lng: 1.0993 },
  Caen: { name: 'Caen', country: 'France', flag: '🇫🇷', lat: 49.1830, lng: -0.3707 },
  Mulhouse: { name: 'Mulhouse', country: 'France', flag: '🇫🇷', lat: 47.7508, lng: 7.3359 },
  Nancy: { name: 'Nancy', country: 'France', flag: '🇫🇷', lat: 48.6921, lng: 6.1844 },
  Roubaix: { name: 'Roubaix', country: 'France', flag: '🇫🇷', lat: 50.6916, lng: 3.1804 },
  Tourcoing: { name: 'Tourcoing', country: 'France', flag: '🇫🇷', lat: 50.7239, lng: 3.1619 },
  Avignon: { name: 'Avignon', country: 'France', flag: '🇫🇷', lat: 43.9493, lng: 4.8055 },
  Créteil: { name: 'Créteil', country: 'France', flag: '🇫🇷', lat: 48.7793, lng: 2.4597 },
  Dunkerque: { name: 'Dunkerque', country: 'France', flag: '🇫🇷', lat: 51.0344, lng: 2.3768 },
  Poitiers: { name: 'Poitiers', country: 'France', flag: '🇫🇷', lat: 46.5802, lng: 0.3404 },
  'Clermont-Ferrand': { name: 'Clermont-Ferrand', country: 'France', flag: '🇫🇷', lat: 45.7797, lng: 3.0863 },
  Versailles: { name: 'Versailles', country: 'France', flag: '🇫🇷', lat: 48.8014, lng: 2.1301 },
  Colmar: { name: 'Colmar', country: 'France', flag: '🇫🇷', lat: 48.0775, lng: 7.3457 },
  Aubervilliers: { name: 'Aubervilliers', country: 'France', flag: '🇫🇷', lat: 48.9170, lng: 2.3833 },
  'Aulnay-sous-Bois': { name: 'Aulnay-sous-Bois', country: 'France', flag: '🇫🇷', lat: 48.9386, lng: 2.4978 },
  'Boulogne-sur-Mer': { name: 'Boulogne-sur-Mer', country: 'France', flag: '🇫🇷', lat: 50.7254, lng: 1.6118 },
  Pau: { name: 'Pau', country: 'France', flag: '🇫🇷', lat: 43.2951, lng: -0.3707 },
  'La Rochelle': { name: 'La Rochelle', country: 'France', flag: '🇫🇷', lat: 46.1591, lng: -1.1521 },
  Antibes: { name: 'Antibes', country: 'France', flag: '🇫🇷', lat: 43.5808, lng: 7.1239 },
  Cannes: { name: 'Cannes', country: 'France', flag: '🇫🇷', lat: 43.5528, lng: 7.0174 },
  'Saint-Nazaire': { name: 'Saint-Nazaire', country: 'France', flag: '🇫🇷', lat: 47.2735, lng: -2.2138 },
  Colombes: { name: 'Colombes', country: 'France', flag: '🇫🇷', lat: 48.9213, lng: 2.2532 },
  Villejuif: { name: 'Villejuif', country: 'France', flag: '🇫🇷', lat: 48.7936, lng: 2.3628 },
  Calais: { name: 'Calais', country: 'France', flag: '🇫🇷', lat: 50.9513, lng: 1.8585 },
  Drancy: { name: 'Drancy', country: 'France', flag: '🇫🇷', lat: 48.9258, lng: 2.4433 },
  Angoulême: { name: 'Angoulême', country: 'France', flag: '🇫🇷', lat: 45.6498, lng: 0.1558 },
  Cambrai: { name: 'Cambrai', country: 'France', flag: '🇫🇷', lat: 50.1727, lng: 3.2325 },
  Béziers: { name: 'Béziers', country: 'France', flag: '🇫🇷', lat: 43.3458, lng: 3.2189 },
  'Saint-Brieuc': { name: 'Saint-Brieuc', country: 'France', flag: '🇫🇷', lat: 48.5140, lng: -2.7655 },
  Tarbes: { name: 'Tarbes', country: 'France', flag: '🇫🇷', lat: 43.2330, lng: 0.0786 },
  Niort: { name: 'Niort', country: 'France', flag: '🇫🇷', lat: 46.3233, lng: -0.4628 },
  Bourges: { name: 'Bourges', country: 'France', flag: '🇫🇷', lat: 47.0810, lng: 2.3978 },
  Chambéry: { name: 'Chambéry', country: 'France', flag: '🇫🇷', lat: 45.5663, lng: 5.9203 },
  'Chalon-sur-Saône': { name: 'Chalon-sur-Saône', country: 'France', flag: '🇫🇷', lat: 46.7811, lng: 4.8522 },
  Laval: { name: 'Laval', country: 'France', flag: '🇫🇷', lat: 48.0701, lng: -0.7734 },
  Arras: { name: 'Arras', country: 'France', flag: '🇫🇷', lat: 50.2910, lng: 2.7766 },
  Vannes: { name: 'Vannes', country: 'France', flag: '🇫🇷', lat: 47.6558, lng: -2.7595 },
  Sète: { name: 'Sète', country: 'France', flag: '🇫🇷', lat: 43.4025, lng: 3.6966 },
  Montauban: { name: 'Montauban', country: 'France', flag: '🇫🇷', lat: 44.0170, lng: 1.3542 },
  Albi: { name: 'Albi', country: 'France', flag: '🇫🇷', lat: 43.9270, lng: 2.1402 },
  Rodez: { name: 'Rodez', country: 'France', flag: '🇫🇷', lat: 44.3516, lng: 2.5754 },
  Bastia: { name: 'Bastia', country: 'France', flag: '🇫🇷', lat: 42.7028, lng: 9.4504 },
  Ajaccio: { name: 'Ajaccio', country: 'France', flag: '🇫🇷', lat: 41.9192, lng: 8.7381 },
  Cayenne: { name: 'Cayenne', country: 'France', flag: '🇫🇷', lat: 4.9224, lng: -52.3135 },
  'Saint-Denis': { name: 'Saint-Denis', country: 'France', flag: '🇫🇷', lat: -20.8788, lng: 55.4528 },
  'Fort-de-France': { name: 'Fort-de-France', country: 'France', flag: '🇫🇷', lat: 14.6035, lng: -61.0746 },
  Papeete: { name: 'Papeete', country: 'France', flag: '🇫🇷', lat: -17.5330, lng: -149.5664 },
  Quimper: { name: 'Quimper', country: 'France', flag: '🇫🇷', lat: 47.9956, lng: -4.0978 },
  Laon: { name: 'Laon', country: 'France', flag: '🇫🇷', lat: 49.5689, lng: 3.6230 },
  Mâcon: { name: 'Mâcon', country: 'France', flag: '🇫🇷', lat: 46.3020, lng: 4.8325 },
  Nevers: { name: 'Nevers', country: 'France', flag: '🇫🇷', lat: 46.9928, lng: 3.1625 },
  Blois: { name: 'Blois', country: 'France', flag: '🇫🇷', lat: 47.5860, lng: 1.3349 },
  Chartres: { name: 'Chartres', country: 'France', flag: '🇫🇷', lat: 48.4439, lng: 1.4992 },
  Vichy: { name: 'Vichy', country: 'France', flag: '🇫🇷', lat: 46.1275, lng: 3.4240 },
  Belfort: { name: 'Belfort', country: 'France', flag: '🇫🇷', lat: 47.6380, lng: 6.8626 },
  Châteauroux: { name: 'Châteauroux', country: 'France', flag: '🇫🇷', lat: 46.8126, lng: 1.6974 },
  Évreux: { name: 'Évreux', country: 'France', flag: '🇫🇷', lat: 49.0217, lng: 1.1518 },
  Narbonne: { name: 'Narbonne', country: 'France', flag: '🇫🇷', lat: 43.1840, lng: 3.0015 },
  'Bourg-en-Bresse': { name: 'Bourg-en-Bresse', country: 'France', flag: '🇫🇷', lat: 46.2059, lng: 5.2258 },
  Gap: { name: 'Gap', country: 'France', flag: '🇫🇷', lat: 44.5563, lng: 6.0813 },
  'Lons-le-Saunier': { name: 'Lons-le-Saunier', country: 'France', flag: '🇫🇷', lat: 46.6754, lng: 5.5521 },
  Mende: { name: 'Mende', country: 'France', flag: '🇫🇷', lat: 44.5183, lng: 3.4991 },
  Auch: { name: 'Auch', country: 'France', flag: '🇫🇷', lat: 43.6483, lng: 0.5782 },
  Périgueux: { name: 'Périgueux', country: 'France', flag: '🇫🇷', lat: 45.1900, lng: 0.7090 },
  Cahors: { name: 'Cahors', country: 'France', flag: '🇫🇷', lat: 44.4495, lng: 1.4333 },
  Aurillac: { name: 'Aurillac', country: 'France', flag: '🇫🇷', lat: 44.9284, lng: 2.4423 },
  Foix: { name: 'Foix', country: 'France', flag: '🇫🇷', lat: 42.9656, lng: 1.6061 },
  Privas: { name: 'Privas', country: 'France', flag: '🇫🇷', lat: 44.7290, lng: 4.5950 },
  Moulins: { name: 'Moulins', country: 'France', flag: '🇫🇷', lat: 46.5643, lng: 3.3325 },
  Dax: { name: 'Dax', country: 'France', flag: '🇫🇷', lat: 43.7208, lng: -1.0518 },
  'Saint-Malo': { name: 'Saint-Malo', country: 'France', flag: '🇫🇷', lat: 48.6493, lng: -2.0255 },
  Arcachon: { name: 'Arcachon', country: 'France', flag: '🇫🇷', lat: 44.6627, lng: -1.1761 },
  Megève: { name: 'Megève', country: 'France', flag: '🇫🇷', lat: 45.8575, lng: 6.6157 },
  'Chamonix-Mont-Blanc': { name: 'Chamonix-Mont-Blanc', country: 'France', flag: '🇫🇷', lat: 45.9237, lng: 6.8694 },
  Courchevel: { name: 'Courchevel', country: 'France', flag: '🇫🇷', lat: 45.4150, lng: 6.6340 },
  Deauville: { name: 'Deauville', country: 'France', flag: '🇫🇷', lat: 49.3591, lng: 0.0686 },
  Honfleur: { name: 'Honfleur', country: 'France', flag: '🇫🇷', lat: 49.4192, lng: 0.2317 },
  Carcassonne: { name: 'Carcassonne', country: 'France', flag: '🇫🇷', lat: 43.2128, lng: 2.3518 },
  Arles: { name: 'Arles', country: 'France', flag: '🇫🇷', lat: 43.6768, lng: 4.6303 },
  Fréjus: { name: 'Fréjus', country: 'France', flag: '🇫🇷', lat: 43.4333, lng: 6.7386 },
  'Saint-Raphaël': { name: 'Saint-Raphaël', country: 'France', flag: '🇫🇷', lat: 43.4264, lng: 6.8297 },
  Menton: { name: 'Menton', country: 'France', flag: '🇫🇷', lat: 43.7748, lng: 7.5042 },
  Étretat: { name: 'Étretat', country: 'France', flag: '🇫🇷', lat: 49.5028, lng: 0.3797 },
  Concarneau: { name: 'Concarneau', country: 'France', flag: '🇫🇷', lat: 47.8756, lng: -3.9199 },

  // ============================================================
  // BELGIQUE
  // ============================================================
  Bruxelles: { name: 'Bruxelles', country: 'Belgique', flag: '🇧🇪', lat: 50.8503, lng: 4.3517 },
  Anvers: { name: 'Anvers', country: 'Belgique', flag: '🇧🇪', lat: 51.2194, lng: 4.4025 },
  Gand: { name: 'Gand', country: 'Belgique', flag: '🇧🇪', lat: 51.0543, lng: 3.7174 },
  Charleroi: { name: 'Charleroi', country: 'Belgique', flag: '🇧🇪', lat: 50.4108, lng: 4.4446 },
  Liège: { name: 'Liège', country: 'Belgique', flag: '🇧🇪', lat: 50.6326, lng: 5.5797 },
  Bruges: { name: 'Bruges', country: 'Belgique', flag: '🇧🇪', lat: 51.2093, lng: 3.2247 },
  Namur: { name: 'Namur', country: 'Belgique', flag: '🇧🇪', lat: 50.4674, lng: 4.8719 },
  Louvain: { name: 'Louvain', country: 'Belgique', flag: '🇧🇪', lat: 50.8792, lng: 4.7012 },
  Mons: { name: 'Mons', country: 'Belgique', flag: '🇧🇪', lat: 50.4550, lng: 3.9444 },
  Alost: { name: 'Alost', country: 'Belgique', flag: '🇧🇪', lat: 50.9378, lng: 3.8385 },
  Malines: { name: 'Malines', country: 'Belgique', flag: '🇧🇪', lat: 51.0257, lng: 4.4761 },
  Courtrai: { name: 'Courtrai', country: 'Belgique', flag: '🇧🇪', lat: 50.8285, lng: 3.2648 },
  Ostende: { name: 'Ostende', country: 'Belgique', flag: '🇧🇪', lat: 51.2283, lng: 2.9126 },
  Tournai: { name: 'Tournai', country: 'Belgique', flag: '🇧🇪', lat: 50.6056, lng: 3.3882 },
  Hasselt: { name: 'Hasselt', country: 'Belgique', flag: '🇧🇪', lat: 50.9320, lng: 5.3397 },
  Ypres: { name: 'Ypres', country: 'Belgique', flag: '🇧🇪', lat: 50.8489, lng: 2.8822 },
  Mouscron: { name: 'Mouscron', country: 'Belgique', flag: '🇧🇪', lat: 50.7432, lng: 3.2165 },
  'La Louvière': { name: 'La Louvière', country: 'Belgique', flag: '🇧🇪', lat: 50.4739, lng: 4.1894 },
  'Saint-Nicolas': { name: 'Saint-Nicolas', country: 'Belgique', flag: '🇧🇪', lat: 51.2440, lng: 4.1434 },
  'Knokke-Heist': { name: 'Knokke-Heist', country: 'Belgique', flag: '🇧🇪', lat: 51.3411, lng: 3.2928 },

  // ============================================================
  // LUXEMBOURG
  // ============================================================
  Luxembourg: { name: 'Luxembourg', country: 'Luxembourg', flag: '🇱🇺', lat: 49.6116, lng: 6.1319 },
  'Esch-sur-Alzette': { name: 'Esch-sur-Alzette', country: 'Luxembourg', flag: '🇱🇺', lat: 49.4958, lng: 5.9806 },
  Differdange: { name: 'Differdange', country: 'Luxembourg', flag: '🇱🇺', lat: 49.5236, lng: 5.8926 },
  Dudelange: { name: 'Dudelange', country: 'Luxembourg', flag: '🇱🇺', lat: 49.4760, lng: 6.0576 },
  Pétange: { name: 'Pétange', country: 'Luxembourg', flag: '🇱🇺', lat: 49.5280, lng: 5.9078 },
  Sanem: { name: 'Sanem', country: 'Luxembourg', flag: '🇱🇺', lat: 49.5633, lng: 5.9291 },
  Ettelbruck: { name: 'Ettelbruck', country: 'Luxembourg', flag: '🇱🇺', lat: 49.8470, lng: 6.1063 },
  Strassen: { name: 'Strassen', country: 'Luxembourg', flag: '🇱🇺', lat: 49.6290, lng: 6.0730 },

  // ============================================================
  // SUISSE
  // ============================================================
  Zurich: { name: 'Zurich', country: 'Suisse', flag: '🇨🇭', lat: 47.3769, lng: 8.5417 },
  Genève: { name: 'Genève', country: 'Suisse', flag: '🇨🇭', lat: 46.2044, lng: 6.1432 },
  Bâle: { name: 'Bâle', country: 'Suisse', flag: '🇨🇭', lat: 47.5596, lng: 7.5886 },
  Lausanne: { name: 'Lausanne', country: 'Suisse', flag: '🇨🇭', lat: 46.5197, lng: 6.6323 },
  Berne: { name: 'Berne', country: 'Suisse', flag: '🇨🇭', lat: 46.9480, lng: 7.4474 },
  Winterthour: { name: 'Winterthour', country: 'Suisse', flag: '🇨🇭', lat: 47.4990, lng: 8.7297 },
  Lucerne: { name: 'Lucerne', country: 'Suisse', flag: '🇨🇭', lat: 47.0502, lng: 8.3093 },
  'Saint-Gall': { name: 'Saint-Gall', country: 'Suisse', flag: '🇨🇭', lat: 47.4239, lng: 9.3748 },
  Lugano: { name: 'Lugano', country: 'Suisse', flag: '🇨🇭', lat: 46.0037, lng: 8.9511 },
  Bienne: { name: 'Bienne', country: 'Suisse', flag: '🇨🇭', lat: 47.1371, lng: 7.2494 },
  Neuchâtel: { name: 'Neuchâtel', country: 'Suisse', flag: '🇨🇭', lat: 46.9899, lng: 6.9293 },
  Fribourg: { name: 'Fribourg', country: 'Suisse', flag: '🇨🇭', lat: 46.8065, lng: 7.1619 },
  Sion: { name: 'Sion', country: 'Suisse', flag: '🇨🇭', lat: 46.2286, lng: 7.3590 },
  Vevey: { name: 'Vevey', country: 'Suisse', flag: '🇨🇭', lat: 46.4636, lng: 6.8428 },
  Montreux: { name: 'Montreux', country: 'Suisse', flag: '🇨🇭', lat: 46.4312, lng: 6.9107 },

  // ============================================================
  // MONACO
  // ============================================================
  Monaco: { name: 'Monaco', country: 'Monaco', flag: '🇲🇨', lat: 43.7384, lng: 7.4246 },

  // ============================================================
  // ESPAGNE
  // ============================================================
  Barcelone: { name: 'Barcelone', country: 'Espagne', flag: '🇪🇸', lat: 41.3851, lng: 2.1734 },
  Madrid: { name: 'Madrid', country: 'Espagne', flag: '🇪🇸', lat: 40.4168, lng: -3.7038 },
  Gérone: { name: 'Gérone', country: 'Espagne', flag: '🇪🇸', lat: 41.9794, lng: 2.8214 },

  // ============================================================
  // ITALIE
  // ============================================================
  Milan: { name: 'Milan', country: 'Italie', flag: '🇮🇹', lat: 45.4642, lng: 9.1900 },
  Turin: { name: 'Turin', country: 'Italie', flag: '🇮🇹', lat: 45.0703, lng: 7.6869 },
  Rome: { name: 'Rome', country: 'Italie', flag: '🇮🇹', lat: 41.9028, lng: 12.4964 },

  // ============================================================
  // PORTUGAL
  // ============================================================
  Lisbonne: { name: 'Lisbonne', country: 'Portugal', flag: '🇵🇹', lat: 38.7223, lng: -9.1393 },
  Porto: { name: 'Porto', country: 'Portugal', flag: '🇵🇹', lat: 41.1579, lng: -8.6291 },
};

export const COUNTRIES = [
  { code: 'ALL', name: 'Tous les pays', flag: '🇪🇺' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
];

// Backwards compatibility dictionary of city lat/lngs
export const FRENCH_CITIES: Record<string, { lat: number; lng: number }> = Object.fromEntries(
  Object.entries(CITIES).map(([key, val]) => [key, { lat: val.lat, lng: val.lng }])
);

/**
 * Calculate distance in kilometers between two GPS coordinates using the Haversine formula.
 */
export function getDistance(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number {
  if (
    lat1 === undefined ||
    lat1 === null ||
    lon1 === undefined ||
    lon1 === null ||
    lat2 === undefined ||
    lat2 === null ||
    lon2 === undefined ||
    lon2 === null
  ) {
    return Infinity;
  }

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Helper to resolve city coordinates if lat/lng are missing
 */
export function resolveLocationCoords(city: string, userLat?: number, userLng?: number): { lat: number; lng: number } {
  if (userLat && userLng) {
    return { lat: userLat, lng: userLng };
  }
  const matched = Object.keys(FRENCH_CITIES).find(
    (c) => c.toLowerCase() === city.trim().toLowerCase()
  );
  if (matched && FRENCH_CITIES[matched]) {
    return FRENCH_CITIES[matched];
  }
  return FRENCH_CITIES['Paris'];
}