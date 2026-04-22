# Analyse Monde Et Impact Du Diabete

## Objectif

Cette section du site ne fait pas une analyse par pays.
Elle ne fait pas non plus une vraie analyse par continents au sens geographique strict.

Elle compare des agregats regionaux publies par l'IDF afin de donner une lecture simple du poids du diabete dans le monde.

La bonne formulation est donc:

- comparaison regionale;
- descriptive;
- basee sur des estimations IDF 2024;
- utile pour la narration visuelle, pas pour une inference causale.

## Unite D'Analyse

La carte utilise 7 regions IDF:

- `North America & Caribbean`
- `South & Central America`
- `Europe`
- `Africa`
- `Middle East & North Africa`
- `South-East Asia`
- `Western Pacific`

Important:

- ce ne sont pas des pays;
- ce ne sont pas des continents stricts;
- les formes SVG sont des silhouettes simplifiees pour l'interface, pas une cartographie geospatiale exacte.

## Sources

Les chiffres utilises dans `docs/assets/world.js` viennent des tables regionales IDF 2024:

- `Age-standardised prevalence of diabetes, %`
- `People with diabetes, in 1,000s`
- `People with type 1 diabetes (all age groups)`

Pages de reference:

- `https://diabetesatlas.org/data-by-indicator/diabetes-estimates-20-79-y/age-adjusted-comparative-prevalence-of-diabetes/`
- `https://diabetesatlas.org/data-by-location/`
- `https://diabetesatlas.org/data-by-indicator/type-1-diabetes-estimates/people-with-type-1-diabetes-all-age-groups/`

## Methode

### 1. Vue Type 2

L'IDF publie une prevalence adulte du diabete pour l'ensemble des cas, pas une prevalence regionale purement "type 2".

La visualisation utilise donc un proxy simple:

- `type2_estimate = age_standardised_prevalence * 0.9`

Justification:

- l'IDF indique que plus de `90%` des cas de diabete sont de type 2;
- on utilise donc `90%` comme approximation visuelle du poids relatif du type 2.

Ce que la vue affiche:

- une couleur de carte basee sur cette prevalence estimee;
- un rappel de la prevalence adulte IDF source;
- le nombre d'adultes vivant avec le diabete en `2024` pour tous types confondus;
- la croissance projetee jusqu'en `2050` pour tous types confondus.

Important:

- la prevalence coloree est un proxy oriente type 2;
- les volumes et projections restent des chiffres IDF "all diabetes", pas des chiffres isoles de type 2.

### 2. Vue Type 1

La version corrigee n'essaie plus de calculer une prevalence regionale de type 1.

Elle utilise directement:

- `type1PeopleAllAges`

Autrement dit:

- la carte compare les effectifs regionaux de personnes vivant avec un diabete de type 1;
- les cartes d'information affichent l'effectif regional et sa part du total mondial reconstitue a partir des 7 regions.

Le calcul de part mondiale est:

- `share_of_global_type1 = region_type1_count / somme_des_regions_type1 * 100`

### 3. Pourquoi L'Ancienne Version Etait Problematique

L'ancienne logique divisait:

- un numerateur `all age groups`;
- par un denominateur `0-79`.

Forme:

- `type1PeopleAllAges / population0To79 * 100`

Ce calcul n'etait pas defendable, parce que:

- le numerateur incluait toutes les classes d'age;
- le denominateur excluait les `80+`;
- le resultat ressemblait a une prevalence alors que les bases d'age n'etaient pas coherentes.

La correction consiste donc a supprimer cette pseudo-prevalence.

### 4. Couleurs

Les couleurs sont normalisees par mode avec un min-max simple entre les 7 regions.

Cela signifie:

- la carte sert a comparer les regions entre elles dans le mode courant;
- la couleur n'est pas une echelle absolue universelle partagee entre `Type 1` et `Type 2`.

## Ce Que La Section Fait Bien

- elle cite une source institutionnelle claire: l'IDF;
- elle se limite a une comparaison regionale descriptive;
- elle distingue maintenant correctement proxy, valeur source et effectif direct;
- elle n'affiche plus une prevalence de type 1 artificielle.

## Limites A Assumer Clairement

- ce n'est pas une analyse par pays;
- ce n'est pas une vraie carte des continents;
- la vue `Type 2` repose sur un proxy simple, pas sur une prevalence regionale directement publiee pour le seul type 2;
- la vue `Type 1` compare des effectifs absolus, donc la taille de population regionale influence fortement le resultat;
- les formes cartographiques sont simplifiees pour le design.

## Formulation Recommandee

On recommande une formulation de ce type:

> Cette visualisation compare des regions IDF et non des pays individuels. La vue Type 2 repose sur un proxy derive de la prevalence adulte du diabete, tandis que la vue Type 1 affiche des effectifs regionaux directs. L'ensemble doit etre lu comme une comparaison descriptive, pas comme une mesure epidemiologique complete.

## Conclusion

La version corrigee est plus honnete que la precedente:

- elle garde une visualisation monde simple et lisible;
- elle retire le calcul de prevalence type 1 qui n'etait pas coherent;
- elle assume clairement la difference entre estimation, effectif direct et simplification graphique.
