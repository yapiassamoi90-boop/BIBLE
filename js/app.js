// Variables globales pour suivre l'état actuel de la lecture
let livreActuel = "genese";
let chapitreActuel = 1;
let testamentActuel = "ancien-testament";

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    initialiserLivres();
    chargerChapitreCourant();
});

// Remplir la liste des livres selon le testament sélectionné
function changerTestament() {
    const testamentSelect = document.getElementById("testamentSelect");
    testamentActuel = testamentSelect.value === "ancien" ? "ancien-testament" : "nouveau-testament";
    
    initialiserLivres();
}

function initialiserLivres() {
    const bookSelect = document.getElementById("bookSelect");
    bookSelect.innerHTML = "";
    
    // Utilisation de la structure définie dans js/bible-structure.js
    const listeLivres = testamentActuel === "ancien-testament" ? window.ancienTestament : window.nouveauTestament;
    
    if (listeLivres) {
        listeLivres.forEach(livre => {
            const option = document.createElement("option");
            option.value = livre.id; // ex: "genese"
            option.textContent = livre.nom; // ex: "Genèse"
            bookSelect.appendChild(option);
        });
        
        // Sélectionner le premier livre par défaut
        livreActuel = listeLivres[0].id;
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
        
        if (chapitreObj) {
            // Mettre à jour l'indicateur de titre
            titreIndicator.textContent = `${document.getElementById("bookSelect").selectedOptions[0].textContent} - Chapitre ${chapitreActuel}`;
            
            // Afficher les versets
            let htmlVersets = "";
            chapitreObj.versets.forEach(v => {
                htmlVersets += `<p style="margin-bottom: 10px;"><sup><strong>${v.numero}</strong></sup> ${v.texte}</p>`;
            });
            conteneur.innerHTML = htmlVersets;
        } else {
            // Si le chapitre n'existe pas encore dans le JSON
            titreIndicator.textContent = `Chapitre ${chapitreActuel}`;
            conteneur.innerHTML = `<p>Le chapitre ${chapitreActuel} de ce livre n'est pas encore disponible dans les fichiers.</p>`;
        }
    } catch (erreur) {
        console.error(erreur);
        titreIndicator.textContent = "Erreur de chargement";
        conteneur.innerHTML = `<p>Impossible de charger le contenu de ce livre pour le moment.</p>`;
    }
}
