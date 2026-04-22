# Analyse Des Organes Et Du Diabete

## Objectif

Cette section du site ne cherche pas a "prouver" qu'un organe cause le diabete.
Son objectif est plus modeste et plus correct:

- relier chaque zone anatomique a un petit groupe de variables du dataset;
- comparer les personnes diagnostiquees et non diagnostiquees;
- afficher des associations descriptives simples, lisibles dans l'interface.

Autrement dit, il s'agit d'une analyse exploratoire et descriptive.

## Donnees Utilisees

Source:

- fichier: `Website/dataset.csv`
- taille: `100000` lignes
- variable cible utilisee dans l'interface: `diagnosed_diabetes`

La proportion de personnes diagnostiquees dans ce fichier est d'environ `60.0%`.
Cette valeur est utile pour lire les resultats du site, mais elle ne doit pas etre interpretee comme une prevalence reelle en population generale.

## Variables Associees A Chaque Organe

Le lien entre organe et variables est un choix editorial pour la visualisation. Il ne vient pas d'un algorithme automatique.

- `lungs`: `smoking_status`, `physical_activity_minutes_per_week`, `sleep_hours_per_day`
- `heart`: `systolic_bp`, `diastolic_bp`, `heart_rate`, `cholesterol_total`, `hdl_cholesterol`, `ldl_cholesterol`, `triglycerides`, `cardiovascular_history`
- `liver`: `triglycerides`, `cholesterol_total`, `bmi`, `waist_to_hip_ratio`
- `pancreas`: `insulin_level`, `glucose_fasting`, `glucose_postprandial`, `hba1c`
- `intestines`: `diet_score`, `glucose_postprandial`, `bmi`, `screen_time_hours_per_day`

## Methode

### 1. Lecture Du CSV

Le fichier est lu dans `organ.js`.
Le parseur prend en charge les champs entre guillemets avec `parseCSVLine()`, puis construit une liste d'objets ligne par ligne.

### 2. Definition De La Cible

L'analyse utilise `diagnosed_diabetes` comme variable cible:

- `1` = personne diagnostiquee
- `0` = personne non diagnostiquee

Ce point est important: l'ancienne version utilisait `diabetes_risk_score`, ce qui etait moins defendable parce que ce score peut deja integrer certaines variables explicatives. La nouvelle version compare directement le diagnostic.

### 3. Detection Du Type De Variable

Pour chaque variable affichee dans l'interface:

- si au moins `95%` des valeurs non vides sont numeriques, la variable est traitee comme numerique;
- sinon, elle est traitee comme categorielle.

Cela permet par exemple:

- de traiter `smoking_status` comme une vraie variable categorielle;
- d'eviter de transformer `Never`, `Former`, `Current` en `NaN`.

### 4. Analyse Des Variables Numeriques

Pour une variable numerique, l'interface affiche:

- la moyenne chez les diagnostiques;
- la moyenne chez les non diagnostiques;
- une association simple avec `diagnosed_diabetes`.

L'association est la correlation de Pearson entre:

- la variable numerique;
- la variable cible binaire `diagnosed_diabetes`.

Interpretation:

- valeur positive: la variable tend a etre plus elevee chez les diagnostiques;
- valeur negative: la variable tend a etre plus faible chez les diagnostiques;
- valeur proche de `0`: peu de lien lineaire observable.

Pour une variable binaire numerique comme `cardiovascular_history`, la moyenne d'un groupe correspond a une proportion.

Exemple:

- une moyenne de `0.086` chez les diagnostiques signifie environ `8.6%` de cas positifs dans ce groupe.

### 5. Analyse Des Variables Categorielles

Pour une variable categorielle, l'interface n'affiche pas de correlation artificielle.
A la place, elle affiche pour chaque categorie:

- le taux de personnes diagnostiquees dans la categorie;
- l'effectif de la categorie.

Exemple pour `smoking_status`:

- `Never`: environ `60.0%` diagnostiques
- `Former`: environ `60.1%` diagnostiques
- `Current`: environ `60.0%` diagnostiques

Dans ce fichier, cette variable ne semble donc presque pas differencier les groupes.

### 6. Tri Des Variables

Dans chaque organe, les variables sont triees par force d'association absolue.
Cela permet de faire remonter en premier les variables les plus discriminantes dans ce dataset.

## Resultats Principaux Verifies

Les valeurs ci-dessous ont ete verifiees directement sur `dataset.csv` et correspondent a la logique actuellement codee.

### Poumons

- `physical_activity_minutes_per_week`
  Diagnostiques: `111.966`
  Non diagnostiques: `129.329`
  Association: `-0.101`
- `sleep_hours_per_day`
  Diagnostiques: `6.997`
  Non diagnostiques: `6.998`
  Association: proche de `0`
- `smoking_status`
  Taux diagnostique quasi identique selon les categories

Lecture:
dans ce dataset, l'activite physique differencie un peu les groupes, alors que le sommeil et le statut tabagique changent tres peu.

### Coeur

- `systolic_bp`
  Diagnostiques: `116.913`
  Non diagnostiques: `114.129`
  Association: `+0.095`
- `ldl_cholesterol`
  Diagnostiques: `104.840`
  Non diagnostiques: `100.241`
  Association: `+0.067`
- `hdl_cholesterol`
  Diagnostiques: `53.613`
  Non diagnostiques: `54.687`
  Association: `-0.051`

Lecture:
les variables cardiovasculaires montrent des ecarts modestes mais coherents dans le sens attendu.

### Foie

- `bmi`
  Diagnostiques: `25.897`
  Non diagnostiques: `25.186`
  Association: `+0.097`
- `waist_to_hip_ratio`
  Diagnostiques: `0.859`
  Non diagnostiques: `0.852`
  Association: `+0.079`
- `cholesterol_total`
  Diagnostiques: `187.499`
  Non diagnostiques: `183.697`
  Association: `+0.058`

Lecture:
les variables liees a l'adiposite et au profil lipidique sont legerement plus elevees chez les personnes diagnostiquees.

### Pancreas

- `hba1c`
  Diagnostiques: `6.972`
  Non diagnostiques: `5.844`
  Association: `+0.679`
- `glucose_postprandial`
  Diagnostiques: `175.944`
  Non diagnostiques: `136.173`
  Association: `+0.630`
- `glucose_fasting`
  Diagnostiques: `116.789`
  Non diagnostiques: `102.610`
  Association: `+0.511`
- `insulin_level`
  Diagnostiques: `9.295`
  Non diagnostiques: `8.711`
  Association: `+0.058`

Lecture:
ce sont les variables les plus discriminantes de toute la page, ce qui est logique pour des marqueurs glycemiques directement relies au diabete.

### Intestins

- `glucose_postprandial`
  Diagnostiques: `175.944`
  Non diagnostiques: `136.173`
  Association: `+0.630`
- `bmi`
  Diagnostiques: `25.897`
  Non diagnostiques: `25.186`
  Association: `+0.097`
- `diet_score`
  Diagnostiques: `5.930`
  Non diagnostiques: `6.091`
  Association: `-0.044`
- `screen_time_hours_per_day`
  Diagnostiques: `6.033`
  Non diagnostiques: `5.942`
  Association: `+0.018`

Lecture:
dans cette zone, les signaux les plus lisibles viennent surtout de `glucose_postprandial` et du `bmi`. Le reste est plus faible.

## Ce Que L'Analyse Fait Bien

- elle compare maintenant la bonne cible: `diagnosed_diabetes`;
- elle separe correctement variables numeriques et categorielles;
- elle evite les resultats artificiels comme la correlation parfaite avec `diabetes_risk_score`;
- elle fournit des chiffres simples, lisibles et defendables pour une visualisation exploratoire.

## Limites A Assumer Clairement

- cette analyse est descriptive, pas causale;
- le lien organe -> variable est choisi pour la narration visuelle;
- la correlation de Pearson est un resume simple, pas un modele complet;
- il n'y a pas d'ajustement pour l'age, le sexe, ou d'autres facteurs;
- certaines variables apparaissent dans plusieurs organes, car le but est narratif et non medical strict.

## Formulation Recommandee Pour Le Rapport Ou La Presentation

On recommande d'utiliser une formulation de ce type:

> Cette visualisation presente des comparaisons descriptives entre personnes diagnostiquees et non diagnostiquees dans le dataset. Les variables sont regroupees par zones anatomiques pour faciliter la lecture, mais ces regroupements relevent d'un choix de visualisation et ne constituent pas une preuve causale.

## Conclusion

La version actuelle de l'analyse est coherente pour un projet de data visualization:

- elle est plus rigoureuse que la version precedente;
- elle reste simple a comprendre pour l'utilisateur;
- elle affiche des resultats consistants avec le dataset.

La bonne maniere de la presenter est donc:

- comme une analyse exploratoire;
- comme une comparaison entre groupes;
- et non comme une demonstration medicale definitive.
