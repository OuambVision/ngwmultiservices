import { getPayload } from 'payload'
import config from '@payload-config'

type Copy = { en: string; fr: string }

type Item = {
  category: string
  description: Copy
  details: Copy[]
  slug: string
  summary: Copy
  title: Copy
}

const items: Item[] = [
  item(
    'automobile',
    'lavage-exterieur-complet',
    'Lavage extérieur complet',
    'Complete exterior wash',
    'Nettoyage haute pression et produits professionnels.',
    'Pressure wash and professional products.',
    'La carrosserie a été lavée à haute pression, puis rincée et séchée à la main. Le sel de route et la poussière ont été retirés sans laisser de traces sur la peinture.',
    'The body was pressure washed, then rinsed and dried by hand. Road salt and dust were removed without streaks on the paint.',
    [
      ['Pré-rinçage — sel et poussière retirés avant le savon', 'Pre-rinse — salt and dust removed before the soap'],
      ['Carrosserie — capot, portes, hayon et bas de caisse', 'Body — hood, doors, tailgate and rocker panels'],
      ['Passages de roues — boue et résidus délogés', 'Wheel arches — mud and residue cleared'],
      ['Séchage à la main — vitres et peinture sans traces', 'Hand dry — glass and paint left streak-free'],
    ],
  ),
  item(
    'automobile',
    'habitacle-repris',
    'Habitacle repris',
    'Cabin refreshed',
    'Sièges, tapis et tableau de bord remis au propre.',
    'Seats, carpets and dashboard cleaned.',
    'L’habitacle a été aspiré, puis les sièges, les tapis et le tableau de bord ont été nettoyés. L’intérieur a été laissé sans miettes ni film gras.',
    'The cabin was vacuumed, then the seats, mats and dashboard were cleaned. The interior was left free of crumbs and greasy film.',
    [
      ['Aspiration — sièges, tapis et coffre', 'Vacuum — seats, mats and trunk'],
      ['Sièges — tissus détachés', 'Seats — fabrics spot cleaned'],
      ['Tableau de bord — surfaces essuyées sans traces', 'Dashboard — surfaces wiped without streaks'],
      ['Tapis — poussière et débris extraits', 'Mats — dust and debris extracted'],
    ],
  ),
  item(
    'automobile',
    'sieges-et-tapis',
    'Sièges et tapis',
    'Seats and carpets',
    'Extraction en profondeur des tissus de l’habitacle.',
    'Deep extraction of the cabin fabrics.',
    'Les sièges et le tapis de sol ont été extraits en profondeur pour retirer la saleté incrustée. Les tissus ont ensuite été laissés sans excès d’eau.',
    'The seats and floor carpet were deep extracted to lift embedded dirt. The fabrics were then left without excess water.',
    [
      ['Extraction — shampooing des sièges et du tapis', 'Extraction — seats and carpet shampooed'],
      ['Taches — reprises une à une', 'Stains — treated one by one'],
      ['Séchage — tissus sans excès d’eau', 'Drying — fabrics left without excess water'],
      ['Finition — fibres redressées', 'Finish — fibres lifted'],
    ],
  ),
  item(
    'automobile',
    'tableau-de-bord-soigne',
    'Tableau de bord soigné',
    'Cared-for dashboard',
    'Finition des surfaces intérieures, sans traces.',
    'Interior surfaces finished, without streaks.',
    'Le tableau de bord, les portes et la console ont été dépoussiérés puis essuyés. Les plastiques et les vitres intérieures ont été laissés sans traces.',
    'The dashboard, doors and console were dusted, then wiped. Interior plastics and glass were left without streaks.',
    [
      ['Dépoussiérage — aérations, console et portes', 'Dusting — vents, console and doors'],
      ['Plastiques — film gras retiré', 'Plastics — greasy film removed'],
      ['Vitres intérieures — essuyées sans traces', 'Interior glass — wiped streak-free'],
      ['Finition — surfaces mates, sans dépôt', 'Finish — matte surfaces, with no residue'],
    ],
  ),
  item(
    'automobile',
    'detail-complet',
    'Détail complet',
    'Full detail',
    'Intérieur et extérieur traités dans la même intervention.',
    'Interior and exterior treated in the same visit.',
    'L’intérieur et l’extérieur ont été traités dans la même visite. La carrosserie, l’habitacle, les jantes et les vitres ont été repris ensemble.',
    'The interior and exterior were treated in the same visit. The body, cabin, wheels and glass were all worked together.',
    [
      ['Extérieur — lavage et séchage de la carrosserie', 'Exterior — body washed and dried'],
      ['Habitacle — aspiration et surfaces essuyées', 'Cabin — vacuumed and surfaces wiped'],
      ['Jantes — dégraissées', 'Wheels — degreased'],
      ['Vitres — intérieur et extérieur sans traces', 'Glass — inside and outside, streak-free'],
    ],
  ),
  item(
    'automobile',
    'camionnette-remise-a-neuf',
    'Camionnette remise à neuf',
    'Truck refreshed',
    'Carrosserie et habitacle d’un VUS repris ensemble.',
    'Body and cabin of an SUV cleaned together.',
    'La carrosserie et l’habitacle du VUS ont été repris dans la même intervention. Les zones hautes, les seuils et le coffre ont été inclus.',
    'The SUV body and cabin were cleaned in the same visit. High panels, sills and the cargo area were included.',
    [
      ['Carrosserie — toit, flancs et hayon', 'Body — roof, sides and tailgate'],
      ['Habitacle — sièges et tapis', 'Cabin — seats and mats'],
      ['Coffre — poussière et débris retirés', 'Cargo area — dust and debris removed'],
      ['Seuils — traces de pas essuyées', 'Sills — foot marks wiped'],
    ],
  ),
  item(
    'automobile',
    'jantes-et-pneus',
    'Jantes et pneus',
    'Wheels and tires',
    'Dégraissage des jantes et finition des pneus.',
    'Wheel degreasing and tire finishing.',
    'Les jantes ont été dégraissées et les pneus finis. La poussière de frein et la boue des passages de roues ont été retirées.',
    'The wheels were degreased and the tires finished. Brake dust and mud in the arches were removed.',
    [
      ['Jantes — poussière de frein retirée', 'Wheels — brake dust removed'],
      ['Pneus — flancs nettoyés', 'Tires — sidewalls cleaned'],
      ['Passages de roues — boue délogée', 'Wheel arches — mud cleared'],
      ['Finition — jantes rincées sans traces', 'Finish — wheels rinsed without marks'],
    ],
  ),
  item(
    'automobile',
    'finition-sans-traces',
    'Finition sans traces',
    'Streak-free finish',
    'Séchage et brillance après le lavage de la carrosserie.',
    'Drying and shine after the body wash.',
    'Après le lavage, la carrosserie a été séchée et les vitres essuyées. La peinture a été laissée sans gouttes ni traces.',
    'After the wash, the body was dried and the glass wiped. The paint was left without drops or streaks.',
    [
      ['Séchage — carrosserie essuyée à la main', 'Drying — body wiped by hand'],
      ['Vitres — intérieur et extérieur', 'Glass — inside and outside'],
      ['Joints — gouttes retirées', 'Seals — drops removed'],
      ['Contrôle — aucune trace laissée au soleil', 'Check — no streaks left in the sun'],
    ],
  ),
  item(
    'residentiel',
    'nettoyage-de-maison',
    'Nettoyage de maison',
    'House cleaning',
    'Salon, chambres et espaces communs impeccables.',
    'Living room, bedrooms and common areas left spotless.',
    'Le salon, les chambres et les espaces communs ont été dépoussiérés, aspirés et les sols lavés. La maison a été laissée en ordre, pièce par pièce.',
    'The living room, bedrooms and common areas were dusted, vacuumed and the floors washed. The house was left in order, room by room.',
    [
      ['Pièces de vie — poussière et sols', 'Living areas — dust and floors'],
      ['Chambres — literie dégagée et sols aspirés', 'Bedrooms — bedding cleared and floors vacuumed'],
      ['Espaces communs — surfaces essuyées', 'Common areas — surfaces wiped'],
      ['Finitions — plinthes et interrupteurs', 'Finish — baseboards and switches'],
    ],
  ),
  item(
    'residentiel',
    'cuisine-eclatante',
    'Cuisine éclatante',
    'Bright kitchen',
    'Désinfection des surfaces et remise en ordre de la cuisine.',
    'Surface disinfection and a reset kitchen.',
    'Les plans de travail, l’évier et les façades ont été nettoyés et désinfectés. La cuisine a été remise en ordre, sans traces de gras.',
    'Counters, the sink and cabinet fronts were cleaned and disinfected. The kitchen was put back in order, without grease marks.',
    [
      ['Plans de travail — gras retiré', 'Counters — grease removed'],
      ['Évier — calcaire et éclaboussures', 'Sink — limescale and splashes'],
      ['Façades — poignées et électros essuyés', 'Fronts — handles and appliances wiped'],
      ['Sol — lavage après le reste de la pièce', 'Floor — washed after the rest of the room'],
    ],
  ),
  item(
    'residentiel',
    'salle-de-bain',
    'Salle de bain',
    'Bathroom',
    'Miroirs, sanitaires et joints repris avec soin.',
    'Mirrors, fixtures and joints carefully cleaned.',
    'Les sanitaires, le miroir et les joints ont été repris. La salle de bain a été laissée sans traces de calcaire ni d’éclaboussures.',
    'The fixtures, mirror and joints were cleaned. The bathroom was left without limescale or splash marks.',
    [
      ['Sanitaires — cuvette, lavabo et douche', 'Fixtures — toilet, sink and shower'],
      ['Miroir — essuyé sans traces', 'Mirror — wiped streak-free'],
      ['Joints — traces de savon retirées', 'Joints — soap marks removed'],
      ['Sol — lavé en dernier', 'Floor — washed last'],
    ],
  ),
  item(
    'residentiel',
    'grand-menage',
    'Grand ménage',
    'Deep clean',
    'Remise à neuf d’un logement avant ou après une occupation.',
    'A home reset before or after occupancy.',
    'Le logement a été repris de fond en comble avant ou après une occupation. Placards, électros, sanitaires et sols ont été inclus.',
    'The home was reset from top to bottom before or after occupancy. Cupboards, appliances, bathrooms and floors were included.',
    [
      ['Pièces — dépoussiérage complet', 'Rooms — full dusting'],
      ['Cuisine — électros et plans de travail', 'Kitchen — appliances and counters'],
      ['Salle de bain — sanitaires et joints', 'Bathroom — fixtures and joints'],
      ['Sols — aspiration puis lavage', 'Floors — vacuumed, then washed'],
    ],
  ),
  item(
    'residentiel',
    'entretien-regulier',
    'Entretien régulier',
    'Regular upkeep',
    'Passage planifié pour garder un appartement au propre.',
    'A scheduled visit to keep an apartment clean.',
    'Un passage planifié a remis l’appartement au propre. Les pièces de vie, la cuisine et la salle de bain ont été entretenues.',
    'A scheduled visit put the apartment back in order. Living areas, the kitchen and the bathroom were maintained.',
    [
      ['Pièces de vie — poussière et sols', 'Living areas — dust and floors'],
      ['Cuisine — surfaces et évier', 'Kitchen — surfaces and sink'],
      ['Salle de bain — sanitaires essuyés', 'Bathroom — fixtures wiped'],
      ['Poubelles — vidées et pourtour essuyé', 'Bins — emptied and the rim wiped'],
    ],
  ),
  item(
    'residentiel',
    'condo',
    'Condo',
    'Condo',
    'Pièces de vie et rangements traités de bout en bout.',
    'Living areas and storage cleaned end to end.',
    'Les pièces de vie et les rangements du condo ont été traités de bout en bout. Les surfaces, les sols et l’entrée ont été inclus.',
    'The condo’s living areas and storage were cleaned end to end. Surfaces, floors and the entry were included.',
    [
      ['Pièces de vie — surfaces et sols', 'Living areas — surfaces and floors'],
      ['Rangements — étagères dépoussiérées', 'Storage — shelves dusted'],
      ['Cuisine — plan de travail et électros', 'Kitchen — counter and appliances'],
      ['Entrée — sol et poignées', 'Entry — floor and handles'],
    ],
  ),
  item(
    'residentiel',
    'tapis-et-meubles',
    'Tapis et meubles',
    'Rugs and furniture',
    'Tissus d’ameublement et tapis ravivés.',
    'Upholstery and rugs refreshed.',
    'Les tissus d’ameublement et les tapis ont été aspirés puis extraits. Les fibres ont été laissées sans tache visible ni excès d’humidité.',
    'Upholstery and rugs were vacuumed, then extracted. The fibres were left without visible stains or excess moisture.',
    [
      ['Aspiration — canapé, fauteuils et tapis', 'Vacuum — sofa, chairs and rugs'],
      ['Taches — reprises sur les tissus', 'Stains — treated on the fabrics'],
      ['Extraction — saleté incrustée retirée', 'Extraction — embedded dirt lifted'],
      ['Séchage — tissus sans excès d’eau', 'Drying — fabrics without excess water'],
    ],
  ),
  item(
    'residentiel',
    'logement-prepare',
    'Logement préparé',
    'Home prepared',
    'Logement préparé avant l’arrivée des occupants.',
    'Home prepared before the occupants arrive.',
    'Le logement a été préparé avant l’arrivée des occupants. Chaque pièce a été dépoussiérée, les sols lavés et les sanitaires repris.',
    'The home was prepared before the occupants arrived. Every room was dusted, the floors washed and the bathrooms cleaned.',
    [
      ['Pièces — dépoussiérage et sols', 'Rooms — dusting and floors'],
      ['Cuisine — plans de travail et évier', 'Kitchen — counters and sink'],
      ['Salle de bain — sanitaires et miroir', 'Bathroom — fixtures and mirror'],
      ['Vitres — traces de doigts retirées', 'Glass — fingerprints removed'],
    ],
  ),
  item(
    'commercial',
    'bureaux',
    'Nettoyage de bureaux',
    'Office cleaning',
    'Espaces de travail propres et sains.',
    'Clean, healthy workspaces.',
    'Les postes, les sols et les surfaces de contact ont été nettoyés. Les bureaux ont été laissés prêts pour la journée suivante.',
    'Desks, floors and contact surfaces were cleaned. The offices were left ready for the next day.',
    [
      ['Postes — bureaux et écrans dépoussiérés', 'Desks — workstations and screens dusted'],
      ['Sols — aspiration et lavage des passages', 'Floors — traffic paths vacuumed and washed'],
      ['Contacts — poignées et interrupteurs', 'Contact points — handles and switches'],
      ['Poubelles — vidées en fin de passage', 'Bins — emptied at the end of the visit'],
    ],
  ),
  item(
    'commercial',
    'vitres-commerciales',
    'Vitres commerciales',
    'Commercial windows',
    'Façades et fenêtres étincelantes.',
    'Sparkling façades and windows.',
    'Les vitrines et les fenêtres ont été lavées des deux côtés lorsque l’accès le permettait. Les cadres ont été essuyés pour enlever les coulures.',
    'Storefronts and windows were washed on both sides where access allowed. Frames were wiped to remove drips.',
    [
      ['Vitrines — lavage intérieur et extérieur', 'Storefronts — washed inside and outside'],
      ['Fenêtres — traces et poussière retirées', 'Windows — marks and dust removed'],
      ['Cadres — coulures essuyées', 'Frames — drips wiped'],
      ['Seuils — débris retirés au pied des vitres', 'Sills — debris cleared at the base of the glass'],
    ],
  ),
  item(
    'commercial',
    'commerce-de-detail',
    'Commerce de détail',
    'Retail space',
    'Sols et présentoirs remis au propre.',
    'Floors and displays cleaned.',
    'Les sols de circulation et les présentoirs ont été remis au propre. Le commerce a été laissé sans traces de pas ni poussière visible.',
    'Traffic floors and displays were cleaned. The shop was left without footprints or visible dust.',
    [
      ['Sols — passages lavés', 'Floors — aisles washed'],
      ['Présentoirs — poussière retirée', 'Displays — dust removed'],
      ['Vitrine — traces de doigts essuyées', 'Window — fingerprints wiped'],
      ['Caisse — comptoir et écran', 'Checkout — counter and screen'],
    ],
  ),
  item(
    'commercial',
    'salle-de-reunion',
    'Salle de réunion',
    'Meeting room',
    'Tables, vitres et sols d’une salle de réunion.',
    'Tables, glass and floors of a meeting room.',
    'La table, les vitres et le sol de la salle ont été nettoyés. La pièce a été laissée prête pour la réunion suivante.',
    'The table, glass and floor of the room were cleaned. The space was left ready for the next meeting.',
    [
      ['Table — surface essuyée', 'Table — surface wiped'],
      ['Vitres — cloisons sans traces', 'Glass — partitions left streak-free'],
      ['Sol — aspiration puis lavage', 'Floor — vacuumed, then washed'],
      ['Contacts — poignées et interrupteurs', 'Contact points — handles and switches'],
    ],
  ),
  item(
    'commercial',
    'entrepot',
    'Entrepôt',
    'Warehouse',
    'Allées et surfaces de circulation dégagées.',
    'Aisles and traffic surfaces cleared.',
    'Les allées et les surfaces de circulation ont été dégagées, puis balayées. La poussière et les débris ont été retirés des passages.',
    'Aisles and traffic surfaces were cleared, then swept. Dust and debris were removed from the walkways.',
    [
      ['Allées — débris retirés', 'Aisles — debris removed'],
      ['Balayage — poussière des passages', 'Sweeping — dust from the walkways'],
      ['Zones de quai — traces et résidus', 'Dock areas — marks and residue'],
      ['Coins — accumulation délogée', 'Corners — buildup cleared'],
    ],
  ),
  item(
    'commercial',
    'espaces-communs',
    'Espaces communs',
    'Common areas',
    'Hall et corridors d’un immeuble.',
    'Lobby and corridors of a building.',
    'Le hall et les corridors ont été dépoussiérés et les sols lavés. Les poignées et les interrupteurs ont été essuyés.',
    'The lobby and corridors were dusted and the floors washed. Handles and switches were wiped.',
    [
      ['Hall — sol et surfaces d’accueil', 'Lobby — floor and reception surfaces'],
      ['Corridors — poussière et lavage', 'Corridors — dusting and mopping'],
      ['Ascenseur — parois et boutons', 'Elevator — walls and buttons'],
      ['Entrée — vitres et poignées', 'Entrance — glass and handles'],
    ],
  ),
  item(
    'commercial',
    'planchers',
    'Planchers',
    'Floors',
    'Décapage et finition des planchers.',
    'Floor stripping and finishing.',
    'Les planchers ont été décapés, puis une finition a été appliquée. La surface a été laissée uniforme, sans ancienne cire.',
    'The floors were stripped, then a finish was applied. The surface was left even, without old wax.',
    [
      ['Décapage — ancienne finition retirée', 'Stripping — old finish removed'],
      ['Rinçage — résidus de décapant', 'Rinse — stripper residue'],
      ['Finition — couche uniforme', 'Finish — an even coat'],
      ['Contrôle — bords et coins inclus', 'Check — edges and corners included'],
    ],
  ),
  item(
    'commercial',
    'locaux-frequentes',
    'Locaux fréquentés',
    'Busy premises',
    'Locaux très fréquentés remis au propre.',
    'High-traffic premises cleaned.',
    'Les locaux très fréquentés ont été remis au propre en commençant par les passages. Les sols, les contacts et les poubelles ont été traités.',
    'The high-traffic premises were cleaned, starting with the walkways. Floors, contact points and bins were covered.',
    [
      ['Passages — sols lavés en priorité', 'Walkways — floors washed first'],
      ['Contacts — poignées et rampes', 'Contact points — handles and rails'],
      ['Sanitaires — reprises si présents', 'Washrooms — cleaned where present'],
      ['Poubelles — vidées et pourtour essuyé', 'Bins — emptied and the rim wiped'],
    ],
  ),
  item(
    'specialise',
    'apres-construction',
    'Nettoyage après construction',
    'Post-construction cleaning',
    'Enlèvement de poussière et de débris de chantier.',
    'Removal of construction dust and debris.',
    'La poussière de chantier et les débris ont été retirés avant la livraison. Les sols, les vitres et les surfaces ont été repris après le gros dépoussiérage.',
    'Construction dust and debris were removed before handover. Floors, glass and surfaces were cleaned after the heavy dusting.',
    [
      ['Débris — chutes et résidus sortis', 'Debris — offcuts and residue removed'],
      ['Poussière — murs, plinthes et cadres', 'Dust — walls, baseboards and frames'],
      ['Vitres — film de chantier retiré', 'Glass — construction film removed'],
      ['Sols — aspiration puis lavage', 'Floors — vacuumed, then washed'],
    ],
  ),
  item(
    'specialise',
    'apres-renovation',
    'Après rénovation',
    'After renovation',
    'Résidus de travaux retirés avant la livraison.',
    'Renovation residue removed before handover.',
    'Les résidus de rénovation ont été retirés avant la livraison. La pièce a été dépoussiérée, les vitres essuyées et le sol lavé.',
    'Renovation residue was removed before handover. The room was dusted, the glass wiped and the floor washed.',
    [
      ['Résidus — poussière de plâtre et éclats', 'Residue — plaster dust and chips'],
      ['Surfaces — meubles et tablettes', 'Surfaces — furniture and shelves'],
      ['Vitres — traces de travaux', 'Glass — work marks'],
      ['Sol — lavage de finition', 'Floor — final wash'],
    ],
  ),
  item(
    'specialise',
    'apres-sinistre',
    'Après sinistre',
    'After a loss',
    'Remise en état d’une pièce touchée.',
    'A damaged room brought back in order.',
    'La pièce touchée a été remise en ordre. Les débris accessibles ont été retirés, puis les surfaces et le sol ont été nettoyés.',
    'The affected room was put back in order. Accessible debris was removed, then surfaces and the floor were cleaned.',
    [
      ['Débris — ce qui pouvait être retiré', 'Debris — what could be removed'],
      ['Surfaces — essuyage des zones accessibles', 'Surfaces — wiping of accessible areas'],
      ['Sol — aspiration et lavage', 'Floor — vacuum and wash'],
      ['Aération — pièce laissée dégagée', 'Air — the room left clear'],
    ],
  ),
  item(
    'specialise',
    'desinfection',
    'Désinfection',
    'Disinfection',
    'Assainissement des surfaces de contact.',
    'Sanitizing of contact surfaces.',
    'Les surfaces de contact ont été nettoyées, puis désinfectées. Poignées, interrupteurs, tables et sanitaires ont été inclus.',
    'Contact surfaces were cleaned, then disinfected. Handles, switches, tables and fixtures were included.',
    [
      ['Contacts — poignées et interrupteurs', 'Contact points — handles and switches'],
      ['Tables — surface désinfectée', 'Tables — surface disinfected'],
      ['Sanitaires — cuvette et lavabo', 'Fixtures — toilet and sink'],
      ['Sol — lavage des passages', 'Floor — traffic paths washed'],
    ],
  ),
  item(
    'specialise',
    'chantier-livre',
    'Chantier livré',
    'Site handed over',
    'Finitions de propreté avant la remise des clés.',
    'Final cleaning before the keys are handed over.',
    'Les finitions de propreté ont été faites avant la remise des clés. Poussière fine, vitres, plinthes et sols ont été repris.',
    'The final clean was done before the keys were handed over. Fine dust, glass, baseboards and floors were covered.',
    [
      ['Poussière fine — cadres, plinthes et tablettes', 'Fine dust — frames, baseboards and shelves'],
      ['Vitres — essuyées sans traces', 'Glass — wiped streak-free'],
      ['Appareils — façades et intérieurs accessibles', 'Appliances — fronts and accessible interiors'],
      ['Sols — dernier lavage', 'Floors — final wash'],
    ],
  ),
  item(
    'specialise',
    'degagement-poussiere',
    'Dégagement de poussière',
    'Dust removal',
    'Plinthes, cadres et grilles dépoussiérés.',
    'Baseboards, frames and vents dusted.',
    'Les plinthes, les cadres et les grilles ont été dépoussiérés. La poussière fine a été retirée avant le lavage des sols.',
    'Baseboards, frames and vents were dusted. Fine dust was removed before the floors were washed.',
    [
      ['Plinthes — poussière retirée sur toute la longueur', 'Baseboards — dust removed along their length'],
      ['Cadres — portes et fenêtres', 'Frames — doors and windows'],
      ['Grilles — aérations dépoussiérées', 'Vents — grilles dusted'],
      ['Sol — aspiration après le dépoussiérage', 'Floor — vacuumed after the dusting'],
    ],
  ),
  item(
    'specialise',
    'assainissement',
    'Assainissement',
    'Sanitizing',
    'Traitement des zones qui demandent un soin particulier.',
    'Treatment of areas that need extra care.',
    'Les zones qui demandaient un soin particulier ont été nettoyées, puis assainies. Le traitement a porté sur les surfaces et les passages.',
    'Areas that needed extra care were cleaned, then sanitized. The work covered the surfaces and the walkways.',
    [
      ['Repérage — zones à traiter en priorité', 'Survey — areas treated first'],
      ['Nettoyage — saleté retirée avant le produit', 'Cleaning — dirt removed before the product'],
      ['Assainissement — surfaces de contact', 'Sanitizing — contact surfaces'],
      ['Contrôle — passages repris en dernier', 'Check — walkways finished last'],
    ],
  ),
  item(
    'specialise',
    'intervention-sur-mesure',
    'Intervention sur mesure',
    'Tailored visit',
    'Besoin particulier pris en charge hors du catalogue.',
    'A specific need handled outside the catalogue.',
    'Le besoin, hors du catalogue habituel, a été pris en charge sur place. Le travail a été limité aux zones convenues, puis vérifié avant de partir.',
    'The need, outside the usual catalogue, was handled on site. The work stayed within the agreed areas, then was checked before leaving.',
    [
      ['Cadrage — zones convenues seulement', 'Scope — agreed areas only'],
      ['Intervention — surfaces et sols concernés', 'Work — the surfaces and floors involved'],
      ['Détails — bords et coins inclus', 'Details — edges and corners included'],
      ['Vérification — résultat revu avant le départ', 'Check — result reviewed before leaving'],
    ],
  ),
]

function item(
  category: string,
  slug: string,
  titleFr: string,
  titleEn: string,
  summaryFr: string,
  summaryEn: string,
  descriptionFr: string,
  descriptionEn: string,
  details: Array<[string, string]>,
): Item {
  return {
    category,
    description: { en: descriptionEn, fr: descriptionFr },
    details: details.map(([fr, en]) => ({ en, fr })),
    slug: `${category}-${slug}`,
    summary: { en: summaryEn, fr: summaryFr },
    title: { en: titleEn, fr: titleFr },
  }
}

function mediaId(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'number') return value.id
  return null
}

const payload = await getPayload({ config })

try {
  const categories = await payload.find({
    collection: 'categories',
    depth: 1,
    limit: 20,
    locale: 'fr',
    overrideAccess: true,
    pagination: false,
  })
  const categoryId = new Map(categories.docs.flatMap((doc) => (doc.slug ? [[doc.slug, doc.id] as const] : [])))
  const pools = new Map<string, number[]>()
  for (const category of categories.docs) {
    if (!category.slug) continue
    const image = mediaId(category.image)
    pools.set(category.slug, image ? [image] : [])
  }

  const services = await payload.find({
    collection: 'services',
    depth: 1,
    limit: 100,
    locale: 'fr',
    overrideAccess: true,
    pagination: false,
  })
  for (const service of services.docs) {
    const category = service.category
    const slug = category && typeof category === 'object' ? category.slug : null
    if (!slug) continue
    const pool = pools.get(slug) ?? []
    const photo = mediaId(service.photo)
    if (photo) pool.push(photo)
    for (const extra of service.photos ?? []) {
      const id = mediaId(extra)
      if (id) pool.push(id)
    }
    pools.set(slug, [...new Set(pool)])
  }

  const existing = await payload.find({
    collection: 'realizations',
    depth: 0,
    limit: 200,
    locale: 'fr',
    overrideAccess: true,
    pagination: false,
  })
  const bySlug = new Map(existing.docs.flatMap((doc) => (doc.slug ? [[doc.slug, doc] as const] : [])))
  const seen = new Map<string, number>()
  let created = 0
  let updated = 0
  const order = ['automobile', 'residentiel', 'commercial', 'specialise']
  const interleaved = Array.from({ length: 8 }, (_, index) =>
    order.flatMap((slug) => items.filter((entry) => entry.category === slug)[index] ?? []),
  ).flat()

  for (const entry of interleaved) {
    const category = categoryId.get(entry.category)
    if (category == null) throw new Error(`Catégorie introuvable : ${entry.category}.`)
    const index = seen.get(entry.category) ?? 0
    seen.set(entry.category, index + 1)
    const pool = pools.get(entry.category) ?? []
    const count = Math.min(5, pool.length)
    const photos = Array.from({ length: count }, (_, offset) => pool[(index + offset) % pool.length])
    const current = bySlug.get(entry.slug)
    const french = {
      category,
      description: entry.description.fr,
      details: entry.details.map((line) => ({ item: line.fr })),
      photos,
      published: true,
      summary: entry.summary.fr,
      title: entry.title.fr,
    }
    const saved = current
      ? await payload.update({
          collection: 'realizations',
          id: current.id,
          locale: 'fr',
          overrideAccess: true,
          data: french,
        })
      : await payload.create({
          collection: 'realizations',
          locale: 'fr',
          overrideAccess: true,
          data: { ...french, slug: entry.slug },
        })
    const ids = (saved.details ?? []).flatMap((row) => (row.id ? [row.id] : []))
    await payload.update({
      collection: 'realizations',
      id: saved.id,
      locale: 'en',
      fallbackLocale: false,
      overrideAccess: true,
      data: {
        description: entry.description.en,
        details: entry.details.map((line, lineIndex) => ({ id: ids[lineIndex], item: line.en })),
        summary: entry.summary.en,
        title: entry.title.en,
      },
    })
    if (current) updated += 1
    else created += 1
  }

  const perCategory = [...seen.entries()].map(([slug, count]) => `${slug} ${count}`).join(', ')
  console.log(`${created} réalisation(s) créée(s), ${updated} mise(s) à jour. ${perCategory}. Toutes sont affichées.`)
} finally {
  await payload.destroy()
}
