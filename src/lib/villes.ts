// Données des villes pour les pages SEO locales
// Chaque ville a un texte unique pour éviter le contenu dupliqué (pénalité Google)

export interface Ville {
  slug: string
  nom: string
  region: string
  departement: string
  habitants: string // approximatif, pour le texte
  proches: string[] // slugs des villes voisines
  intro: string // phrase unique par ville
  quartiers: string[] // quartiers/zones connues pour le texte local
}

export const villes: Ville[] = [
  {
    slug: 'paris',
    nom: 'Paris',
    region: 'Île-de-France',
    departement: '75',
    habitants: '2,1 millions',
    proches: ['boulogne-billancourt', 'saint-denis', 'versailles', 'creteil'],
    intro:
      "Capitale du libertinage européen, Paris concentre le plus grand nombre de clubs échangistes de France et une communauté libertine très active, du Marais aux Champs-Élysées.",
    quartiers: ['Le Marais', 'Pigalle', 'Champs-Élysées', 'Bastille'],
  },
  {
    slug: 'marseille',
    nom: 'Marseille',
    region: 'Provence-Alpes-Côte d\'Azur',
    departement: '13',
    habitants: '870 000',
    proches: ['aix-en-provence', 'toulon', 'avignon'],
    intro:
      "Entre mer et soleil, Marseille abrite une scène libertine méditerranéenne décontractée, avec des soirées privées réputées du Vieux-Port aux calanques.",
    quartiers: ['Vieux-Port', 'Le Panier', 'La Corniche', 'Castellane'],
  },
  {
    slug: 'lyon',
    nom: 'Lyon',
    region: 'Auvergne-Rhône-Alpes',
    departement: '69',
    habitants: '520 000',
    proches: ['villeurbanne', 'saint-etienne', 'grenoble'],
    intro:
      "Deuxième scène libertine de France, Lyon est réputée pour ses clubs élégants de la Presqu'île et ses soirées entre épicuriens qui savent recevoir.",
    quartiers: ['Presqu\'île', 'Croix-Rousse', 'Part-Dieu', 'Confluence'],
  },
  {
    slug: 'toulouse',
    nom: 'Toulouse',
    region: 'Occitanie',
    departement: '31',
    habitants: '500 000',
    proches: ['montpellier', 'bordeaux', 'perpignan'],
    intro:
      "La Ville Rose porte bien son nom : la communauté libertine toulousaine est chaleureuse, jeune et festive, du Capitole aux bords de la Garonne.",
    quartiers: ['Capitole', 'Saint-Cyprien', 'Carmes', 'Compans'],
  },
  {
    slug: 'nice',
    nom: 'Nice',
    region: 'Provence-Alpes-Côte d\'Azur',
    departement: '06',
    habitants: '340 000',
    proches: ['cannes', 'antibes', 'monaco', 'toulon'],
    intro:
      "Sur la Côte d'Azur, Nice attire une communauté libertine cosmopolite et estivale, entre plages naturistes de la Riviera et soirées glamour.",
    quartiers: ['Promenade des Anglais', 'Vieux-Nice', 'Cimiez', 'Port'],
  },
  {
    slug: 'nantes',
    nom: 'Nantes',
    region: 'Pays de la Loire',
    departement: '44',
    habitants: '320 000',
    proches: ['angers', 'rennes', 'saint-nazaire'],
    intro:
      "Ville créative et ouverte d'esprit, Nantes voit sa communauté libertine grandir rapidement, notamment chez les jeunes couples de l'Île de Nantes.",
    quartiers: ['Île de Nantes', 'Bouffay', 'Graslin', 'Chantenay'],
  },
  {
    slug: 'montpellier',
    nom: 'Montpellier',
    region: 'Occitanie',
    departement: '34',
    habitants: '300 000',
    proches: ['nimes', 'toulouse', 'perpignan'],
    intro:
      "Étudiante et ensoleillée, Montpellier a l'une des communautés libertines les plus jeunes de France, entre l'Écusson et les plages de Palavas.",
    quartiers: ['Écusson', 'Antigone', 'Port Marianne', 'Beaux-Arts'],
  },
  {
    slug: 'strasbourg',
    nom: 'Strasbourg',
    region: 'Grand Est',
    departement: '67',
    habitants: '290 000',
    proches: ['mulhouse', 'nancy', 'metz'],
    intro:
      "Aux portes de l'Allemagne, Strasbourg mêle discrétion alsacienne et ouverture européenne, avec des libertins qui fréquentent les deux côtés du Rhin.",
    quartiers: ['Petite France', 'Krutenau', 'Neudorf', 'Orangerie'],
  },
  {
    slug: 'bordeaux',
    nom: 'Bordeaux',
    region: 'Nouvelle-Aquitaine',
    departement: '33',
    habitants: '260 000',
    proches: ['toulouse', 'la-rochelle', 'bayonne'],
    intro:
      "Entre vignobles et océan, Bordeaux cultive un libertinage épicurien : dîners fins, soirées en petit comité et escapades vers le Bassin d'Arcachon.",
    quartiers: ['Chartrons', 'Saint-Pierre', 'Bastide', 'Caudéran'],
  },
  {
    slug: 'lille',
    nom: 'Lille',
    region: 'Hauts-de-France',
    departement: '59',
    habitants: '235 000',
    proches: ['roubaix', 'valenciennes', 'arras'],
    intro:
      "Réputés pour leur convivialité, les libertins lillois forment une communauté soudée et festive, proche de la Belgique et de ses clubs réputés.",
    quartiers: ['Vieux-Lille', 'Wazemmes', 'Euralille', 'Fives'],
  },
  {
    slug: 'rennes',
    nom: 'Rennes',
    region: 'Bretagne',
    departement: '35',
    habitants: '220 000',
    proches: ['nantes', 'saint-malo', 'brest'],
    intro:
      "Capitale bretonne jeune et dynamique, Rennes voit émerger une scène libertine discrète mais active, du centre historique à la côte d'Émeraude.",
    quartiers: ['Centre historique', 'Thabor', 'Sainte-Anne', 'Villejean'],
  },
  {
    slug: 'reims',
    nom: 'Reims',
    region: 'Grand Est',
    departement: '51',
    habitants: '180 000',
    proches: ['troyes', 'nancy', 'metz'],
    intro:
      "Au cœur de la Champagne, Reims associe l'art de la fête au raffinement : les soirées libertines s'y dégustent comme les bulles, avec élégance.",
    quartiers: ['Centre-ville', 'Boulingrin', 'Clairmarais', 'Cathédrale'],
  },
  {
    slug: 'toulon',
    nom: 'Toulon',
    region: 'Provence-Alpes-Côte d\'Azur',
    departement: '83',
    habitants: '180 000',
    proches: ['marseille', 'nice', 'aix-en-provence'],
    intro:
      "Entre rade et Mont Faron, Toulon profite de la douceur varoise : plages naturistes du littoral et communauté libertine détendue toute l'année.",
    quartiers: ['Mourillon', 'Centre-ville', 'Le Port', 'Saint-Jean'],
  },
  {
    slug: 'grenoble',
    nom: 'Grenoble',
    region: 'Auvergne-Rhône-Alpes',
    departement: '38',
    habitants: '160 000',
    proches: ['lyon', 'chambery', 'valence'],
    intro:
      "Au pied des Alpes, Grenoble combine week-ends en chalet et soirées privées : une communauté libertine sportive et nature, active été comme hiver.",
    quartiers: ['Centre-ville', 'Île Verte', 'Championnet', 'Europole'],
  },
  {
    slug: 'dijon',
    nom: 'Dijon',
    region: 'Bourgogne-Franche-Comté',
    departement: '21',
    habitants: '160 000',
    proches: ['besancon', 'lyon', 'troyes'],
    intro:
      "Capitale des Ducs de Bourgogne, Dijon cultive un libertinage gourmand : la communauté locale aime les bonnes tables autant que les belles rencontres.",
    quartiers: ['Centre historique', 'Toison d\'Or', 'Montchapet', 'République'],
  },
  {
    slug: 'angers',
    nom: 'Angers',
    region: 'Pays de la Loire',
    departement: '49',
    habitants: '155 000',
    proches: ['nantes', 'tours', 'le-mans'],
    intro:
      "Douceur angevine oblige, la scène libertine d'Angers privilégie les rencontres en petit comité et les soirées entre habitués des bords de Maine.",
    quartiers: ['La Doutre', 'Centre-ville', 'Justices', 'Lac de Maine'],
  },
  {
    slug: 'nimes',
    nom: 'Nîmes',
    region: 'Occitanie',
    departement: '30',
    habitants: '150 000',
    proches: ['montpellier', 'avignon', 'arles'],
    intro:
      "Sous le soleil gardois, Nîmes vibre au rythme des férias : la communauté libertine locale est festive, spontanée et fidèle à ses soirées d'été.",
    quartiers: ['Écusson', 'Jean-Jaurès', 'Gambetta', 'Costières'],
  },
  {
    slug: 'aix-en-provence',
    nom: 'Aix-en-Provence',
    region: 'Provence-Alpes-Côte d\'Azur',
    departement: '13',
    habitants: '145 000',
    proches: ['marseille', 'avignon', 'toulon'],
    intro:
      "Élégante et bourgeoise, Aix-en-Provence abrite un libertinage chic et discret : les soirées privées y sont plus courues que les clubs.",
    quartiers: ['Cours Mirabeau', 'Mazarin', 'Sextius', 'Jas de Bouffan'],
  },
  {
    slug: 'clermont-ferrand',
    nom: 'Clermont-Ferrand',
    region: 'Auvergne-Rhône-Alpes',
    departement: '63',
    habitants: '145 000',
    proches: ['lyon', 'saint-etienne', 'limoges'],
    intro:
      "Au pied des volcans, Clermont-Ferrand a une communauté libertine plus grande qu'on ne l'imagine, chaleureuse et sans chichis, à l'image de l'Auvergne.",
    quartiers: ['Centre Jaude', 'Montferrand', 'Salins', 'Chamalières'],
  },
  {
    slug: 'le-havre',
    nom: 'Le Havre',
    region: 'Normandie',
    departement: '76',
    habitants: '170 000',
    proches: ['rouen', 'caen', 'deauville'],
    intro:
      "Face à la Manche, Le Havre voit sa scène libertine s'animer entre soirées en ville et escapades vers les plages normandes et Deauville.",
    quartiers: ['Centre reconstruit', 'Saint-François', 'Perret', 'Sainte-Adresse'],
  },
  {
    slug: 'saint-etienne',
    nom: 'Saint-Étienne',
    region: 'Auvergne-Rhône-Alpes',
    departement: '42',
    habitants: '175 000',
    proches: ['lyon', 'clermont-ferrand', 'grenoble'],
    intro:
      "Populaire et authentique, Saint-Étienne offre un libertinage accessible et convivial, à 45 minutes de la scène lyonnaise pour varier les plaisirs.",
    quartiers: ['Centre-ville', 'Fauriel', 'Bellevue', 'Carnot'],
  },
  {
    slug: 'tours',
    nom: 'Tours',
    region: 'Centre-Val de Loire',
    departement: '37',
    habitants: '140 000',
    proches: ['angers', 'orleans', 'le-mans'],
    intro:
      "Au cœur des châteaux de la Loire, Tours mêle romantisme et libertinage : week-ends en chambres d'hôtes coquines et soirées du Vieux-Tours.",
    quartiers: ['Vieux-Tours', 'Plumereau', 'Prébendes', 'Deux-Lions'],
  },
  {
    slug: 'perpignan',
    nom: 'Perpignan',
    region: 'Occitanie',
    departement: '66',
    habitants: '120 000',
    proches: ['montpellier', 'toulouse', 'narbonne'],
    intro:
      "Aux portes de l'Espagne, Perpignan profite du naturisme catalan historique : le Cap d'Agde n'est pas loin et la communauté locale est très active l'été.",
    quartiers: ['Centre historique', 'Saint-Jacques', 'Moulin à Vent', 'Las Cobas'],
  },
  {
    slug: 'metz',
    nom: 'Metz',
    region: 'Grand Est',
    departement: '57',
    habitants: '120 000',
    proches: ['nancy', 'strasbourg', 'luxembourg-ville'],
    intro:
      "Frontalière du Luxembourg et de l'Allemagne, Metz attire des libertins des trois pays : une communauté internationale et discrète.",
    quartiers: ['Centre-ville', 'Sainte-Croix', 'Nouvelle Ville', 'Plantières'],
  },
  {
    slug: 'nancy',
    nom: 'Nancy',
    region: 'Grand Est',
    departement: '54',
    habitants: '105 000',
    proches: ['metz', 'strasbourg', 'dijon'],
    intro:
      "Autour de la place Stanislas, Nancy cultive un libertinage étudiant et festif l'hiver, qui migre vers les lacs vosgiens dès les beaux jours.",
    quartiers: ['Vieille Ville', 'Charles III', 'Saint-Pierre', 'Rives de Meurthe'],
  },
  {
    slug: 'rouen',
    nom: 'Rouen',
    region: 'Normandie',
    departement: '76',
    habitants: '115 000',
    proches: ['le-havre', 'caen', 'evreux'],
    intro:
      "À une heure de Paris, Rouen combine l'accès à la scène parisienne et une communauté normande locale fidèle à ses soirées entre habitués.",
    quartiers: ['Vieux-Marché', 'Saint-Marc', 'Jardin des Plantes', 'Rive Gauche'],
  },
  {
    slug: 'avignon',
    nom: 'Avignon',
    region: 'Provence-Alpes-Côte d\'Azur',
    departement: '84',
    habitants: '90 000',
    proches: ['nimes', 'aix-en-provence', 'marseille'],
    intro:
      "Dans la cité des Papes, le libertinage vauclusien s'épanouit entre mas provençaux privatisés et soirées estivales pendant le Festival.",
    quartiers: ['Intra-muros', 'Les Halles', 'Saint-Ruf', 'Montfavet'],
  },
  {
    slug: 'caen',
    nom: 'Caen',
    region: 'Normandie',
    departement: '14',
    habitants: '105 000',
    proches: ['rouen', 'le-havre', 'deauville'],
    intro:
      "Entre plages du Débarquement et Côte Fleurie, Caen a une communauté libertine discrète qui aime se retrouver à Deauville et Cabourg.",
    quartiers: ['Centre-ville', 'Vaucelles', 'Université', 'La Prairie'],
  },
  {
    slug: 'versailles',
    nom: 'Versailles',
    region: 'Île-de-France',
    departement: '78',
    habitants: '85 000',
    proches: ['paris', 'boulogne-billancourt', 'saint-denis'],
    intro:
      "Héritière des fêtes galantes de la Cour, Versailles abrite aujourd'hui des libertins yvelinois élégants qui naviguent entre l'ouest parisien et la capitale.",
    quartiers: ['Notre-Dame', 'Saint-Louis', 'Montreuil', 'Chantiers'],
  },
  {
    slug: 'boulogne-billancourt',
    nom: 'Boulogne-Billancourt',
    region: 'Île-de-France',
    departement: '92',
    habitants: '120 000',
    proches: ['paris', 'versailles', 'issy-les-moulineaux'],
    intro:
      "Aux portes de Paris, Boulogne-Billancourt concentre des couples libertins CSP+ qui profitent de la scène parisienne tout en cultivant la discrétion des Hauts-de-Seine.",
    quartiers: ['Centre-ville', 'Silly-Gallieni', 'Prince-Marmottan', 'Rives de Seine'],
  },
]

export function getVille(slug: string): Ville | undefined {
  return villes.find((v) => v.slug === slug)
}

export function getVillesProches(ville: Ville): Ville[] {
  return ville.proches
    .map((slug) => getVille(slug))
    .filter((v): v is Ville => v !== undefined)
}
