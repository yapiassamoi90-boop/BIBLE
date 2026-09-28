async function chargerChapitre(livre, chapitreNum) {
    // Exemple de chemin : data/ancien-testament/genese.json
    const cheminFichier = `data/ancien-testament/${livre}.json`;
    
    try {
        const reponse = await fetch(cheminFichier);
        if (!reponse.ok) {
            throw new Error(`Erreur HTTP : ${reponse.status}`);
        }
        
        const donnees = await reponse.json();
        
        // Trouver le chapitre correspondant dans le tableau JSON
        const chapitreObj = donnees.find(c => c.chapitre === parseInt(chapitreNum));
        
        if (chapitreObj) {
            afficherVersets(chapitreObj);
        } else {
            console.error("Chapitre introuvable !");
        }
    } catch (erreur) {
        console.error("Impossible de charger les données du livre :", erreur);
    }
}

function afficherVersets(chapitreObj) {
    const conteneur = document.getElementById("conteneur-versets"); // Remplace par l'ID de ton conteneur HTML
    conteneur.innerHTML = `<h2>Chapitre ${chapitreObj.chapitre}</h2>`;
    
    let htmlVersets = "";
    chapitreObj.versets.forEach(v => {
        htmlVersets += `<p><sup>${v.numero}</sup> ${v.texte}</p>`;
    });
    
    conteneur.innerHTML += htmlVersets;
}

// Exemple d'appel pour tester directement :
// chargerChapitre("genese", 1);
