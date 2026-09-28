// Variables globales pour suivre l'état actuel de la lecture
let livreActuel = "genese";
let chapitreActuel = 1;
let testamentActuel = "ancien-testament";

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    changerTestament();
});

// Remplir la liste des livres selon le testament sélectionné
function changerTestament() {
    const testamentSelect = document.getElementById("testamentSelect");
    // testamentSelect.value peut être "ancien" ou "nouveau"
    const valeurSelect = testamentSelect.value;
    
    testamentActuel = valeurSelect === "ancien" ? "ancien-testament" : "nouveau-testament";
    initialiserLivres(valeurSelect);
}

function initialiserLivres(valeurTestament) {
    const bookSelect = document.getElementById("bookSelect");
    bookSelect.innerHTML = "";
    
    // Utilisation de la structure globale BIBLE_STRUCTURE définie dans bible-structure.js
    let listeLivres = [];
    if (window.BIBLE_STRUCTURE) {
        if (valeurTestament === "ancien") {
            listeLivres = window.BIBLE_STRUCTURE.ancienTestament;
        } else {
            listeLivres = window.BIBLE_STRUCTURE.nouveauTestament;
        }
    }
    
    if (listeLivres && listeLivres.length > 0) {
        listeLivres.forEach(livre => {
            const option = document.createElement("option");
            // Le nom du fichier dans ton structure.js est par ex "genese.json" -> on enlève le .json pour l'id
            const idLivre = livre.fichier.replace(".json", "").toLowerCase();
            option.value = idLivre; 
            option.textContent = livre.nom;
            bookSelect.appendChild(option);
        });
        
        // Sélectionner le premier livre par défaut
        livreActuel = listeLivres[0].fichier.replace(".json", "").toLowerCase();
        chapitreActuel = 1;
        chargerChapitreCourant();
    }
}

// Changement de livre via le menu déroulant
function changerLivre() {
    const bookSelect = document.getElementById("bookSelect");
    livreActuel = bookSelect.value;
    chapitreActuel = 1; // Recommencer au chapitre 1
    chargerChapitreCourant();
}

// Navigation entre les chapitres (Précédent / Suivant)
function changerChapitre(direction) {
    chapitreActuel += direction;
    if (chapitreActuel < 1) chapitreActuel = 1; // Empêcher d'aller en dessous de 1
    chargerChapitreCourant();
}

// Charger le fichier JSON du livre et afficher le chapitre
async function chargerChapitreCourant() {
    const cheminFichier = `data/${testamentActuel}/${livreActuel}.json`;
    const conteneur = document.getElementById("contentContainer");
    const titreIndicator = document.getElementById("currentBookChapter");
    
    conteneur.innerHTML = "<p>Chargement en cours...</p>";
    
    try {
        const reponse = await fetch(cheminFichier);
        if (!reponse.ok) {
            throw new Error("Fichier de données introuvable pour ce livre.");
        }
        
        const donnees = await reponse.json();
        const chapitreObj = donnees.find(c => c.chapitre === chapitreActuel);
        
        const bookSelect = document.getElementById("bookSelect");
        const nomLivreAffiche = bookSelect.selectedOptions.length > 0 ? bookSelect.selectedOptions[0].textContent : livreActuel;
        
        if (chapitreObj) {
            // Mettre à jour l'indicateur de titre
            titreIndicator.textContent = `${nomLivreAffiche} - Chapitre ${chapitreActuel}`;
            
            // Afficher les versets
            let htmlVersets = "";
            chapitreObj.versets.forEach(v => {
                htmlVersets += `<p style="margin-bottom: 10px;"><sup><strong>${v.numero}</strong></sup> ${v.texte}</p>`;
            });
            conteneur.innerHTML = htmlVersets;
        } else {
            // Si le chapitre n'existe pas encore dans le JSON
            titreIndicator.textContent = `${nomLivreAffiche} - Chapitre ${chapitreActuel}`;
            conteneur.innerHTML = `<p>Le chapitre ${chapitreActuel} de ce livre n'est pas encore disponible dans les fichiers.</p>`;
        }
    } catch (erreur) {
        console.error(erreur);
        titreIndicator.textContent = "Erreur de chargement";
        conteneur.innerHTML = `<p>Impossible de charger le contenu de ce livre pour le moment (le fichier JSON correspondant doit être créé dans le dossier <code>data/${testamentActuel}/</code>).</p>`;
    }
}
