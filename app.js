let livreActuelDonnees = null;
let testamentActuel = "ancien";
let livreActuelIndex = 0;
let chapitreActuel = 1;

document.addEventListener("DOMContentLoaded", () => {
    mettreAJourListeLivres();
    chargerLivreActuel();

    document.getElementById("searchBtn").addEventListener("click", executerRecherche);
    document.getElementById("searchInput").addEventListener("keypress", (e) => {
        if (e.key === "Enter") executerRecherche();
    });
});

function changerTestament() {
    testamentActuel = document.getElementById("testamentSelect").value;
    livreActuelIndex = 0;
    chapitreActuel = 1;
    mettreAJourListeLivres();
    chargerLivreActuel();
}

function mettreAJourListeLivres() {
    const bookSelect = document.getElementById("bookSelect");
    bookSelect.innerHTML = "";
    
    const liste = testamentActuel === "ancien" ? BIBLE_STRUCTURE.ancienTestament : BIBLE_STRUCTURE.nouveauTestament;
    
    liste.forEach((livre, index) => {
        let opt = document.createElement("option");
        opt.value = index;
        opt.innerText = livre.nom;
        bookSelect.appendChild(opt);
    });
}

function changerLivre() {
    livreActuelIndex = parseInt(document.getElementById("bookSelect").value);
    chapitreActuel = 1;
    chargerLivreActuel();
}

async function chargerLivreActuel() {
    const liste = testamentActuel === "ancien" ? BIBLE_STRUCTURE.ancienTestament : BIBLE_STRUCTURE.nouveauTestament;
    const livreInfo = liste[livreActuelIndex];
    const dossier = testamentActuel === "ancien" ? "ancien-testament" : "nouveau-testament";

    try {
        const response = await fetch(`data/${dossier}/${livreInfo.fichier}`);
        if (!response.ok) throw new Error("Fichier JSON non trouvé");
        livreActuelDonnees = await response.json();
    } catch (error) {
        // Mode secours si le fichier JSON du livre n'est pas encore créé
        livreActuelDonnees = genererDonneesSecours(livreInfo.nom, chapitreActuel);
    }

    afficherChapitre();
}

function afficherChapitre() {
    const liste = testamentActuel === "ancien" ? BIBLE_STRUCTURE.ancienTestament : BIBLE_STRUCTURE.nouveauTestament;
    const nomLivre = liste[livreActuelIndex].nom;

    document.getElementById("currentBookChapter").innerText = `${nomLivre} - Chapitre ${chapitreActuel}`;
    
    const container = document.getElementById("contentContainer");
    container.innerHTML = "";
    document.getElementById("searchResultsSection").classList.add("hidden");

    const scenesDuChapitre = livreActuelDonnees.filter(s => s.chapitre === chapitreActuel);

    if (scenesDuChapitre.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding: 20px;">Contenu en cours de rédaction pour ce chapitre.</p>`;
        return;
    }

    scenesDuChapitre.forEach(scene => {
        let sceneHTML = `
            <div class="scene-card">
                <div class="scene-image-container">
                    <img src="${scene.illustration}" alt="${scene.legendeScene}">
                </div>
                <div class="scene-content">
                    <div class="scene-legend">${scene.legendeScene}</div>
        `;

        scene.versets.forEach(v => {
            sceneHTML += `
                <div class="verse-item">
                    <span class="verse-number">${v.numero}</span>
                    <span>${v.texte}</span>
                </div>
            `;
        });

        sceneHTML += `</div></div>`;
        container.innerHTML += sceneHTML;
    });
}

function changerChapitre(direction) {
    const liste = testamentActuel === "ancien" ? BIBLE_STRUCTURE.ancienTestament : BIBLE_STRUCTURE.nouveauTestament;
    const maxChapitres = liste[livreActuelIndex].chapitres;

    let nouveauChap = chapitreActuel + direction;
    if (nouveauChap >= 1 && nouveauChap <= maxChapitres) {
        chapitreActuel = nouveauChap;
        afficherChapitre();
    }
}

function executerRecherche() {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    if (!query) return;

    const resultsList = document.getElementById("searchResultsList");
    resultsList.innerHTML = "";
    let matchesCount = 0;

    // Pour l'instant, recherche dans les données chargées (on pourra l'étendre à toute la base plus tard)
    if (livreActuelDonnees) {
        livreActuelDonnees.forEach(scene => {
            scene.versets.forEach(v => {
                if (v.texte.toLowerCase().includes(query)) {
                    matchesCount++;
                    resultsList.innerHTML += `
                        <div class="scene-card" style="padding: 15px;">
                            <strong>Chapitre ${scene.chapitre} (Verset ${v.numero})</strong>
                            <p>${v.texte}</p>
                        </div>
                    `;
                }
            });
        });
    }

    if (matchesCount === 0) {
        resultsList.innerHTML = `<p style="text-align:center; padding: 20px;">Aucun résultat trouvé dans ce livre pour "${query}".</p>`;
    }

    document.getElementById("searchResultsSection").classList.remove("hidden");
}

function fermerRecherche() {
    document.getElementById("searchResultsSection").classList.add("hidden");
}

function genererDonneesSecours(nomLivre, chap) {
    return [
        {
            chapitre: chap,
            illustration: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
            legendeScene: `Scène illustrative pour ${nomLivre} - Chapitre ${chap}`,
            versets: [
                { numero: 1, texte: `Ceci est un exemple de verset 1 pour ${nomLivre} chapitre ${chap}. Crée ton fichier JSON pour remplacer ce texte par la vraie Bible !` },
                { numero: 2, texte: `Ceci est un exemple de verset 2 pour ${nomLivre} chapitre ${chap}.` }
            ]
        }
    ];
}
