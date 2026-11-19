"use strict";

const form = document.querySelector("#evaluator-form");
const candidateNameInput = document.querySelector("#candidate-name");
const titleInput = document.querySelector("#job-title");
const jobDescriptionInput = document.querySelector("#job-description");
const languageList = document.querySelector("#language-list");
const addLanguageButton = document.querySelector("#add-language");
const certificationList = document.querySelector("#certification-list");
const addCertificationButton = document.querySelector("#add-certification");
const experienceDurationInput = document.querySelector("#experience-duration");
const cvFileInput = document.querySelector("#cv-file");
const fileStatus = document.querySelector("#file-status");
const formError = document.querySelector("#form-error");
const calculateButton = form.querySelector(".calculate-button");
const checklistPanel = document.querySelector("#checklist-panel");
const results = document.querySelector("#results");
const scoreValue = document.querySelector("#score-value");
const progressTrack = document.querySelector(".progress-track");
const progressFill = document.querySelector("#progress-fill");
const scoreNote = document.querySelector("#score-note");
const resultsMessage = document.querySelector("#results-message");
const breakdownList = document.querySelector("#score-breakdown");
const feedbackList = document.querySelector("#feedback-list");
const candidateResultName = document.querySelector("#candidate-result-name");
const keywordSummary = document.querySelector("#keyword-summary");
const matchedKeywordsList = document.querySelector("#matched-keywords");
const missingKeywordsList = document.querySelector("#missing-keywords");
const additionalResults = document.querySelector("#additional-results");
const experienceResult = document.querySelector("#experience-result");
const certificationResults = document.querySelector("#certification-results");
const saveProfileButton = document.querySelector("#save-profile");
const saveProfileStatus = document.querySelector("#save-profile-status");
const savedProfilesPanel = document.querySelector("#saved-profiles");
const savedProfileList = document.querySelector("#saved-profile-list");
const profilesStorageStatus = document.querySelector("#profiles-storage-status");
const compareProfilesButton = document.querySelector("#compare-profiles");
const comparisonStatus = document.querySelector("#comparison-status");
const comparisonResult = document.querySelector("#comparison-result");
const comparisonHead = document.querySelector("#comparison-head");
const comparisonBody = document.querySelector("#comparison-body");
let cvText = "";
let fileReadGeneration = 0;
let cvReadPromise = Promise.resolve();
const savedProfilesStorageKey = "clearcv.savedProfiles";
const profileCategoryNames = [
  "Lisibilité ATS",
  "Structure",
  "Mots-clés",
  "Contenu",
  "Adaptation au pays",
  "Orthographe et grammaire"
];
let savedProfiles = [];
let currentProfile = null;
let profileStorageError = "";
let selectedProfileIds = new Set();
const languageLevels = [
  ["", "Choisir un niveau"],
  ["A1", "A1 — Débutant"],
  ["A2", "A2 — Élémentaire"],
  ["B1", "B1 — Intermédiaire"],
  ["B2", "B2 — Intermédiaire avancé"],
  ["C1", "C1 — Avancé"],
  ["C2", "C2 — Maîtrise"],
  ["TOEFL", "TOEFL"],
  ["TOEIC", "TOEIC"],
  ["Natif", "Langue maternelle"]
];

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

form.addEventListener("input", () => {
  results.hidden = true;
  formError.hidden = true;
});

form.querySelectorAll('input[name="review-mode"]').forEach((input) => {
  input.addEventListener("change", () => {
    const automaticMode = input.value === "automatic" && input.checked;
    checklistPanel.hidden = automaticMode;
    results.hidden = true;
  });
});

cvFileInput.addEventListener("change", () => {
  results.hidden = true;
  formError.hidden = true;
  cvText = "";
  const generation = ++fileReadGeneration;
  const [file] = cvFileInput.files;
  if (!file) {
    fileStatus.textContent = "Importez un PDF contenant du texte. Les PDF numérisés en image peuvent être illisibles.";
    return;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension !== "pdf") {
    fileStatus.textContent = "Format non pris en charge. Sélectionnez un fichier PDF.";
    return;
  }
  if (!window.pdfjsLib) {
    fileStatus.textContent = "La bibliothèque de lecture PDF n’a pas pu être chargée. Vérifiez votre connexion Internet puis rechargez la page.";
    return;
  }

  fileStatus.textContent = `Lecture de ${file.name} dans votre navigateur…`;
  cvReadPromise = extractPdfText(file, generation);
});

async function extractPdfText(file, generation) {
  try {
    const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      if (generation !== fileReadGeneration) {
        return null;
      }
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => item.str).join(" "));
    }
    if (generation !== fileReadGeneration) {
      return null;
    }
    const extractedText = pages.join("\n").trim();
    if (!extractedText) {
      fileStatus.textContent = `${file.name} ne contient pas de texte sélectionnable. Il s’agit peut-être d’un document numérisé ; choisissez un PDF contenant du texte.`;
      return null;
    }
    cvText = extractedText;
    fileStatus.textContent = `${file.name} est prêt. Texte extrait localement de ${pdf.numPages} page${pdf.numPages === 1 ? "" : "s"}.`;
    return extractedText;
  } catch (error) {
    if (generation !== fileReadGeneration) {
      return null;
    }
    fileStatus.textContent = `Impossible de lire ${file.name}. Vérifiez que le PDF est valide et non protégé, puis réessayez.`;
    console.error("Impossible d’extraire le texte du PDF importé.", error);
    return null;
  }
}

function addLanguageRow(language = "", level = "") {
  const row = document.createElement("div");
  row.className = "language-row";

  const nameLabel = document.createElement("label");
  nameLabel.className = "language-field";
  const nameText = document.createElement("span");
  nameText.textContent = "Langue";
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.name = "language";
  nameInput.autocomplete = "off";
  nameInput.placeholder = "Ex. Français";
  nameInput.value = language;
  nameLabel.append(nameText, nameInput);

  const levelLabel = document.createElement("label");
  levelLabel.className = "language-field";
  const levelText = document.createElement("span");
  levelText.textContent = "Niveau";
  const levelSelect = document.createElement("select");
  levelSelect.name = "language-level";
  languageLevels.forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    option.selected = value === level;
    levelSelect.append(option);
  });
  levelLabel.append(levelText, levelSelect);

  const removeButton = document.createElement("button");
  removeButton.className = "remove-language-button";
  removeButton.type = "button";
  removeButton.setAttribute("aria-label", "Supprimer cette langue");
  removeButton.textContent = "Supprimer";
  removeButton.addEventListener("click", () => {
    row.remove();
    results.hidden = true;
  });

  row.append(nameLabel, levelLabel, removeButton);
  languageList.append(row);
}

addLanguageButton.addEventListener("click", () => {
  addLanguageRow();
  languageList.lastElementChild.querySelector("input").focus();
});

addLanguageRow();

function addCertificationRow(name = "") {
  const row = document.createElement("div");
  row.className = "certification-row";

  const label = document.createElement("label");
  label.className = "language-field";
  const labelText = document.createElement("span");
  labelText.textContent = "Nom de la certification";
  const input = document.createElement("input");
  input.type = "text";
  input.name = "certification";
  input.autocomplete = "off";
  input.placeholder = "Ex. Google Analytics";
  input.value = name;
  label.append(labelText, input);

  const removeButton = document.createElement("button");
  removeButton.className = "remove-language-button";
  removeButton.type = "button";
  removeButton.setAttribute("aria-label", "Supprimer cette certification");
  removeButton.textContent = "Supprimer";
  removeButton.addEventListener("click", () => {
    row.remove();
    results.hidden = true;
  });

  row.append(label, removeButton);
  certificationList.append(row);
}

addCertificationButton.addEventListener("click", () => {
  addCertificationRow();
  certificationList.lastElementChild.querySelector("input").focus();
});

function loadSavedProfiles() {
  try {
    const storedProfiles = localStorage.getItem(savedProfilesStorageKey);
    if (!storedProfiles) {
      return [];
    }
    const parsedProfiles = JSON.parse(storedProfiles);
    if (!Array.isArray(parsedProfiles) || parsedProfiles.some((profile) =>
      !profile || typeof profile.id !== "string" ||
      typeof profile.name !== "string" ||
      typeof profile.jobTitle !== "string" ||
      !Number.isFinite(profile.score) ||
      typeof profile.reviewMode !== "string" ||
      !Number.isFinite(profile.matchedKeywords) ||
      !Number.isFinite(profile.totalKeywords) ||
      !Array.isArray(profile.languages) ||
      !Array.isArray(profile.certifications) ||
      !Array.isArray(profile.categories)
    )) {
      throw new Error("Le format des profils enregistrés est invalide.");
    }
    return parsedProfiles;
  } catch (error) {
    profileStorageError = error instanceof SyntaxError
      ? "Les profils enregistrés sont illisibles. Ils n’ont pas été supprimés."
      : `Impossible de lire les profils enregistrés : ${error.message}`;
    console.error("Impossible de charger les profils enregistrés.", error);
    return [];
  }
}

function saveProfilesToStorage(profiles) {
  try {
    localStorage.setItem(savedProfilesStorageKey, JSON.stringify(profiles));
    profileStorageError = "";
    return true;
  } catch (error) {
    profileStorageError = `Impossible d’enregistrer les profils dans ce navigateur : ${error.message}`;
    console.error("Impossible de sauvegarder les profils.", error);
    return false;
  }
}

function updateComparisonControls() {
  selectedProfileIds = new Set(
    [...selectedProfileIds].filter((id) => savedProfiles.some((profile) => profile.id === id))
  );
  const selectedCount = selectedProfileIds.size;
  compareProfilesButton.disabled = selectedCount < 2;
  comparisonStatus.textContent = selectedCount < 2
    ? "Sélectionnez au moins deux profils."
    : `${selectedCount} profils sélectionnés.`;
  if (selectedCount < 2) {
    comparisonResult.hidden = true;
  }
}

function renderSavedProfiles() {
  savedProfileList.replaceChildren();
  savedProfiles.forEach((profile) => {
    const item = document.createElement("li");
    item.className = "saved-profile-item";

    const selectionLabel = document.createElement("label");
    selectionLabel.className = "saved-profile-selection";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = profile.id;
    checkbox.checked = selectedProfileIds.has(profile.id);
    checkbox.setAttribute("aria-label", `Sélectionner le profil ${profile.name} pour comparaison`);

    const details = document.createElement("span");
    details.className = "saved-profile-details";
    const name = document.createElement("strong");
    name.textContent = profile.name;
    const job = document.createElement("span");
    job.textContent = profile.jobTitle;
    const date = document.createElement("small");
    date.textContent = new Date(profile.savedAt).toLocaleString("fr-FR");
    details.append(name, job, date);

    const score = document.createElement("strong");
    score.className = "saved-profile-score";
    score.textContent = `${profile.score}/100`;
    selectionLabel.append(checkbox, details, score);

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedProfileIds.add(profile.id);
      } else {
        selectedProfileIds.delete(profile.id);
      }
      comparisonResult.hidden = true;
      updateComparisonControls();
    });

    const removeButton = document.createElement("button");
    removeButton.className = "remove-language-button";
    removeButton.type = "button";
    removeButton.textContent = "Supprimer";
    removeButton.setAttribute("aria-label", `Supprimer le profil ${profile.name}`);
    removeButton.addEventListener("click", () => {
      const remainingProfiles = savedProfiles.filter((savedProfile) => savedProfile.id !== profile.id);
      if (saveProfilesToStorage(remainingProfiles)) {
        savedProfiles = remainingProfiles;
        selectedProfileIds.delete(profile.id);
      }
      renderSavedProfiles();
    });

    item.append(selectionLabel, removeButton);
    savedProfileList.append(item);
  });

  profilesStorageStatus.textContent = profileStorageError;
  savedProfilesPanel.hidden = savedProfiles.length === 0 && !profileStorageError;
  updateComparisonControls();
}

function renderProfileComparison(profiles) {
  comparisonHead.replaceChildren();
  comparisonBody.replaceChildren();

  const headRow = document.createElement("tr");
  const criteriaHeading = document.createElement("th");
  criteriaHeading.scope = "col";
  criteriaHeading.textContent = "Critère";
  headRow.append(criteriaHeading);
  profiles.forEach((profile) => {
    const heading = document.createElement("th");
    heading.scope = "col";
    heading.textContent = profile.name;
    headRow.append(heading);
  });
  comparisonHead.append(headRow);

  const rows = [
    { label: "Poste", value: (profile) => profile.jobTitle },
    { label: "Score", value: (profile) => `${profile.score}/100` },
    { label: "Mode d’évaluation", value: (profile) => profile.reviewMode },
    { label: "Mots-clés trouvés", value: (profile) => `${profile.matchedKeywords} / ${profile.totalKeywords}` },
    { label: "Langues", value: (profile) => profile.languages.length ? profile.languages.map(({ language, level }) => `${language} (${level})`).join(", ") : "—" },
    { label: "Certifications", value: (profile) => profile.certifications.length ? profile.certifications.join(", ") : "—" },
    { label: "Expérience", value: (profile) => profile.experienceDuration || "—" },
    ...profileCategoryNames.map((categoryName) => ({
      label: categoryName,
      value: (profile) => {
        const category = profile.categories.find((entry) => entry.name === categoryName);
        return !category || category.earned === null
          ? "Non évalué"
          : `${category.earned} / ${category.possible}`;
      }
    }))
  ];

  rows.forEach(({ label, value }) => {
    const row = document.createElement("tr");
    const heading = document.createElement("th");
    heading.scope = "row";
    heading.textContent = label;
    row.append(heading);
    profiles.forEach((profile) => {
      const cell = document.createElement("td");
      cell.textContent = value(profile);
      row.append(cell);
    });
    comparisonBody.append(row);
  });
  comparisonResult.hidden = false;
}

savedProfiles = loadSavedProfiles();
renderSavedProfiles();

compareProfilesButton.addEventListener("click", () => {
  const profilesToCompare = savedProfiles.filter((profile) => selectedProfileIds.has(profile.id));
  if (profilesToCompare.length < 2) {
    comparisonStatus.textContent = "Sélectionnez au moins deux profils pour les comparer.";
    return;
  }
  renderProfileComparison(profilesToCompare);
});

saveProfileButton.addEventListener("click", () => {
  if (!currentProfile) {
    saveProfileStatus.textContent = "Calculez d’abord le score du profil.";
    return;
  }

  const profileToSave = {
    ...currentProfile,
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    savedAt: new Date().toISOString()
  };
  const updatedProfiles = [...savedProfiles, profileToSave];
  if (!saveProfilesToStorage(updatedProfiles)) {
    saveProfileStatus.textContent = profileStorageError;
    renderSavedProfiles();
    return;
  }

  savedProfiles = updatedProfiles;
  selectedProfileIds.add(profileToSave.id);
  saveProfileStatus.textContent = `Profil « ${profileToSave.name} » enregistré dans ce navigateur.`;
  renderSavedProfiles();
});

const stopWords = new Set([
  "about", "across", "after", "also", "and", "are", "because", "been", "being",
  "between", "both", "can", "candidate", "candidates", "could", "each", "experience",
  "for", "from", "have", "having", "into", "including", "into", "its", "job",
  "knowledge", "looking", "more", "must", "our", "role", "should", "skill", "skills",
  "strong", "such", "that", "their", "these", "this", "through", "time", "under",
  "using", "various", "with", "within", "will", "work", "working", "you", "your",
  "ainsi", "alors", "avec", "avoir", "comme", "dans", "depuis", "des", "dont",
  "elle", "elles", "entre", "est", "être", "leurs", "mais", "nous", "pour",
  "qui", "que", "quel", "quelle", "sont", "tous", "tout", "une", "vous",
  "votre", "vos", "sur", "par", "plus", "moins", "notre", "aux", "afin",
  "chez", "cette", "ces", "aussi", "poste", "mission", "missions", "recherche"
]);

const actionVerbs = [
  "achieved", "analyzed", "built", "collaborated", "created", "delivered",
  "designed", "developed", "established", "improved", "increased", "launched",
  "led", "managed", "organized", "produced", "reduced", "resolved", "streamlined",
  "supported", "trained", "accompagné", "amélioré", "analysé", "conçu",
  "coordonné", "créé", "développé", "dirigé", "géré", "mis en place",
  "optimisé", "organisé", "participé", "piloté", "réalisé", "réduit",
  "supervisé", "soutenu", "structuré"
];

function getKeywordTerms(text) {
  const terms = text.toLocaleLowerCase("fr").match(/[\p{L}][\p{L}\p{N}+#]*(?:[.-][\p{L}\p{N}+#]+)*/gu) ?? [];
  return new Set(
    terms.filter((word) => word.length >= 3 && !stopWords.has(word))
  );
}

function analyzeText(jobTitle, jobDescription, cvText, languages) {
  const cvLower = cvText.toLocaleLowerCase("fr");
  const descriptionTerms = getKeywordTerms(jobDescription);
  const cvTerms = getKeywordTerms(cvText);
  const matchedTerms = [...descriptionTerms].filter((term) => cvTerms.has(term));
  const keywordScore = descriptionTerms.size === 0
    ? 0
    : Math.round((matchedTerms.length / descriptionTerms.size) * 10);
  const exactTitleMatch = jobTitle.trim().length > 0 && cvLower.includes(jobTitle.trim().toLocaleLowerCase("fr"));

  const firstBlock = cvText.trim().split(/\n\s*\n/)[0]?.trim() ?? "";
  const firstBlockWords = firstBlock.match(/\b[\w'-]+\b/g)?.length ?? 0;
  const hasSummary = firstBlockWords >= 35 && firstBlockWords <= 120;
  const matchedVerbs = actionVerbs.filter((verb) =>
    new RegExp(`(?<![\\p{L}\\p{N}])${verb}(?![\\p{L}\\p{N}])`, "iu").test(cvText)
  );
  const hasActionVerbs = matchedVerbs.length > 0;
  const hasNumbers = /\b\d+(?:[.,]\d+)?\s?%?/.test(cvText);
  const hasLanguageLevel = /\b(?:B1|B2|C1|C2|TOEFL|TOEIC)\b/i.test(cvText) ||
    languages.some(({ language, level }) => language.trim() && /^(?:B1|B2|C1|C2|TOEFL|TOEIC)$/i.test(level));

  return {
    titleScore: exactTitleMatch ? 5 : 0,
    keywordScore,
    matchedTerms,
    totalTerms: descriptionTerms.size,
    summaryScore: hasSummary ? 5 : 0,
    actionVerbScore: hasActionVerbs ? 5 : 0,
    matchedVerbs,
    numbersScore: hasNumbers ? 8 : 0,
    languageScore: hasLanguageLevel ? 3 : 0,
    hasSummary,
    hasNumbers,
    hasLanguageLevel
  };
}

function addListItem(list, text, className = "") {
  const item = document.createElement("li");
  item.textContent = text;
  if (className) {
    item.className = className;
  }
  list.append(item);
}

function renderKeywordResults(analysis) {
  keywordSummary.textContent =
    `${analysis.matchedTerms.length} mot${analysis.matchedTerms.length > 1 ? "s" : ""} sur ${analysis.totalTerms} détecté${analysis.totalTerms > 1 ? "s" : ""}`;
  matchedKeywordsList.replaceChildren();
  missingKeywordsList.replaceChildren();

  if (analysis.matchedTerms.length === 0) {
    addListItem(matchedKeywordsList, "Aucun mot-clé correspondant.");
  } else {
    analysis.matchedTerms.forEach((keyword) => addListItem(matchedKeywordsList, keyword));
  }
  if (analysis.missingTerms.length === 0) {
    addListItem(missingKeywordsList, "Tous les mots-clés détectés ont été trouvés.");
  } else {
    analysis.missingTerms.forEach((keyword) => addListItem(missingKeywordsList, keyword));
  }
}

function renderResults(score, categories, analysis, automaticMode, rawTextScore, candidateName, languages, certifications, experienceDuration) {
  scoreValue.textContent = String(score);
  progressFill.style.width = `${score}%`;
  progressTrack.setAttribute("aria-valuenow", String(score));
  candidateResultName.textContent = candidateName ? `Candidat : ${candidateName}` : "";
  renderKeywordResults(analysis);
  scoreNote.textContent = automaticMode
    ? `Score automatique du texte : ${rawTextScore} sur 36 points évaluables, ramené sur 100. Les critères visuels, de mise en page, d’adaptation au pays, d’acronymes et d’orthographe ne sont pas évalués.`
    : "Les critères de la liste de contrôle dépendent de vos réponses ; les critères textuels sont analysés automatiquement.";
  resultsMessage.textContent = score >= 80
    ? "Votre CV est bien préparé. Quelques ajustements ciblés peuvent encore renforcer votre candidature."
    : score >= 60
      ? "Votre CV est sur la bonne voie. Consultez les suggestions pour renforcer votre candidature."
      : "Votre CV peut être amélioré. Utilisez la liste de contrôle et les conseils pour mieux l’adapter aux logiciels ATS.";

  breakdownList.replaceChildren();
  categories.forEach(({ name, earned, possible }) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    const points = document.createElement("strong");
    label.textContent = name;
    points.textContent = earned === null ? "Non évalué" : `${earned} / ${possible}`;
    item.append(label, points);
    breakdownList.append(item);
  });

  feedbackList.replaceChildren();
  const suggestions = [];
  if (!analysis.titleScore) {
    suggestions.push("Ajoutez l’intitulé exact du poste dans votre CV lorsqu’il est pertinent.");
  }
  if (analysis.keywordScore < 10) {
    const missing = analysis.totalTerms - analysis.matchedTerms.length;
    suggestions.push(analysis.totalTerms === 0
      ? "Ajoutez des précisions à la description du poste pour activer la comparaison des mots-clés."
      : `Pensez à inclure les termes pertinents de l’offre que vous maîtrisez réellement (${missing} non détecté${missing > 1 ? "s" : ""}).`);
  }
  if (!analysis.hasSummary) {
    suggestions.push("Ajoutez en haut du CV un résumé concis de 35 à 120 mots.");
  }
  if (analysis.matchedVerbs.length === 0) {
    suggestions.push("Commencez vos expériences par des verbes d’action comme développé, dirigé ou amélioré.");
  }
  if (!analysis.hasNumbers) {
    suggestions.push("Quantifiez vos résultats avec des chiffres, des pourcentages ou des indicateurs mesurables.");
  }
  if (!analysis.hasLanguageLevel) {
    suggestions.push("Indiquez votre niveau de langue (B1 à C2) ou un résultat TOEFL/TOEIC, si applicable.");
  }
  if (suggestions.length === 0) {
    suggestions.push(automaticMode
      ? "Bravo pour les critères textuels. Pensez à vérifier séparément les critères visuels et de mise en page."
      : "Bravo pour les critères textuels. Vérifiez les critères visuels et adaptez votre CV à chaque candidature.");
  }
  suggestions.forEach((suggestion) => addListItem(feedbackList, suggestion));
  addListItem(
    feedbackList,
    `Mots-clés : ${analysis.matchedTerms.length} sur ${analysis.totalTerms} termes uniques trouvés.`,
    "positive"
  );
  if (languages.length > 0) {
    addListItem(
      feedbackList,
      `Langues indiquées : ${languages.map(({ language, level }) => `${language} (${level})`).join(", ")}.`,
      "positive"
    );
  }
  const hasAdditionalDetails = certifications.length > 0 || experienceDuration;
  additionalResults.hidden = !hasAdditionalDetails;
  certificationResults.replaceChildren();
  certifications.forEach((certification) => addListItem(certificationResults, certification));
  experienceResult.textContent = experienceDuration
    ? `Expérience professionnelle : ${experienceDuration}.`
    : "";

  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const jobTitle = titleInput.value.trim();
  const candidateName = candidateNameInput.value.trim();
  const jobDescription = jobDescriptionInput.value.trim();
  const languages = [...languageList.querySelectorAll(".language-row")]
    .map((row) => ({
      language: row.querySelector('[name="language"]').value.trim(),
      level: row.querySelector('[name="language-level"]').value
    }))
    .filter(({ language, level }) => language && level);
  const certifications = [...certificationList.querySelectorAll('[name="certification"]')]
    .map((input) => input.value.trim())
    .filter(Boolean);
  const experienceDuration = experienceDurationInput.value;
  const automaticMode = form.querySelector('input[name="review-mode"]:checked').value === "automatic";
  const spellingInput = form.querySelector('input[name="spelling"]:checked');

  if (!jobTitle || !jobDescription) {
    formError.textContent = "Renseignez l’intitulé et la description du poste avant de calculer le score.";
    formError.hidden = false;
    const firstMissing = !jobTitle ? titleInput : jobDescriptionInput;
    firstMissing.focus();
    return;
  }

  if (!cvText.trim() && cvFileInput.files.length > 0 && fileStatus.textContent.startsWith("Lecture de ")) {
    calculateButton.disabled = true;
    calculateButton.setAttribute("aria-busy", "true");
    calculateButton.firstChild.textContent = "Lecture du PDF… ";
    try {
      await cvReadPromise;
    } finally {
      calculateButton.disabled = false;
      calculateButton.removeAttribute("aria-busy");
      calculateButton.firstChild.textContent = "Calculer mon score ";
    }
  }

  const uploadedCVText = cvText.trim();
  if (!uploadedCVText || (!automaticMode && !spellingInput)) {
    const fileProblem = fileStatus.textContent;
    formError.textContent = !uploadedCVText && fileProblem && !fileProblem.startsWith("Lecture de ")
      ? `Le CV n’a pas pu être extrait. ${fileProblem}`
      : automaticMode
        ? "Importez un PDF lisible avant de calculer le score."
        : "Importez un PDF lisible et évaluez l’orthographe et la grammaire.";
    formError.hidden = false;
    const missingField = !uploadedCVText ? cvFileInput : form.querySelector('input[name="spelling"]');
    missingField.focus();
    return;
  }
  formError.hidden = true;

  const analysis = analyzeText(jobTitle, jobDescription, uploadedCVText, languages);
  analysis.missingTerms = [...getKeywordTerms(jobDescription)]
    .filter((term) => !analysis.matchedTerms.includes(term));
  const checkedScores = [...form.querySelectorAll('input[name="score"]:checked')];
  const checkedPoints = checkedScores
    .reduce((total, input) => total + Number(input.value), 0);
  const spellingScore = spellingInput ? Number(spellingInput.value) : 0;
  const checkboxPoints = (category) => checkedScores
    .filter((input) => input.dataset.category === category)
    .reduce((sum, input) => sum + Number(input.value), 0);
  const categories = automaticMode
    ? [
        { name: "Lisibilité ATS", earned: null, possible: null },
        { name: "Structure", earned: null, possible: null },
        { name: "Mots-clés", earned: analysis.titleScore + analysis.keywordScore, possible: 15 },
        { name: "Contenu", earned: analysis.summaryScore + analysis.actionVerbScore + analysis.numbersScore + analysis.languageScore, possible: 21 },
        { name: "Adaptation au pays", earned: null, possible: null },
        { name: "Orthographe et grammaire", earned: null, possible: null }
      ]
    : [
        { name: "Lisibilité ATS", earned: checkboxPoints("readability"), possible: 25 },
        { name: "Structure", earned: checkboxPoints("structure"), possible: 15 },
        { name: "Mots-clés", earned: analysis.titleScore + analysis.keywordScore + checkboxPoints("keywords"), possible: 20 },
        { name: "Contenu", earned: analysis.summaryScore + analysis.actionVerbScore + analysis.numbersScore + analysis.languageScore + checkboxPoints("content"), possible: 25 },
        { name: "Adaptation au pays", earned: checkboxPoints("country"), possible: 10 },
        { name: "Orthographe et grammaire", earned: spellingScore, possible: 5 }
      ];
  const automatedPoints = analysis.titleScore + analysis.keywordScore +
    analysis.summaryScore + analysis.actionVerbScore + analysis.numbersScore + analysis.languageScore;
  const totalScore = automaticMode
    ? Math.round((automatedPoints / 36) * 100)
    : Math.min(100, checkedPoints + automatedPoints + spellingScore);

  currentProfile = {
    name: candidateName || "Candidat sans nom",
    jobTitle,
    score: totalScore,
    reviewMode: automaticMode ? "Automatique" : "Avec liste de contrôle",
    matchedKeywords: analysis.matchedTerms.length,
    totalKeywords: analysis.totalTerms,
    languages,
    certifications,
    experienceDuration,
    categories: categories.map((category) => ({ ...category }))
  };
  saveProfileStatus.textContent = "";
  renderResults(totalScore, categories, analysis, automaticMode, automatedPoints, candidateName, languages, certifications, experienceDuration);
});
