# Évaluation et comparaison de CV ATS

Application navigateur pour lire le texte de CV PDF, fournir une évaluation
indicative sur 100 points selon la grille ATS, et comparer plusieurs profils.

## Utilisation

1. Ouvrez `index.html` dans un navigateur.
2. Saisissez le poste visé et jusqu’à dix mots-clés de l’offre.
3. Importez un CV PDF de 20 Mo maximum et de 30 pages maximum.
4. Consultez le score par critère, puis donnez un nom au profil et enregistrez-le.
5. Importez d’autres CV : le tableau compare les profils selon la même offre.

Les profils sont enregistrés localement avec leur nom, le nom du fichier, le
nombre de pages, la date d’enregistrement et le texte extrait ; les fichiers
PDF eux-mêmes ne sont pas stockés. Supprimez les profils individuellement ou
effacez toute la comparaison depuis l’application.

## Grille de notation

La grille reprend les six blocs de l’image fournie : lisibilité ATS (25),
structure (15), mots-clés (20), contenu (25), adaptation au pays (10) et
orthographe (5).

Le lecteur PDF évalue les indices disponibles dans le texte extrait et affiche
un score normalisé sur 100, avec le nombre de points réellement évaluables.
La mise en page en colonnes, les tableaux, les icônes, la police, l’ordre visuel,
la conformité des données personnelles et le nombre exact de fautes ne peuvent
pas être jugés de manière fiable par cette lecture automatique. Ces points sont
signalés comme à vérifier, pas comme des fautes. Les résultats restent
approximatifs et ne doivent pas décider du rejet d’une candidature.

Le lecteur PDF.js est chargé depuis cdnjs et nécessite une connexion Internet.
Les PDF scannés sans texte ne bénéficient pas d’OCR.
