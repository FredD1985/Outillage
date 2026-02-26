// ==========================
// STOCKAGE LOCAL
// ==========================

let equipements = JSON.parse(localStorage.getItem("equipements")) || [];
let destinations = JSON.parse(localStorage.getItem("destinations")) || [];
let utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];
let mouvements = JSON.parse(localStorage.getItem("mouvements")) || [];

function saveData() {
    localStorage.setItem("equipements", JSON.stringify(equipements));
    localStorage.setItem("destinations", JSON.stringify(destinations));
    localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
    localStorage.setItem("mouvements", JSON.stringify(mouvements));
}

// ==========================
// NAVIGATION
// ==========================

function showSection(id) {

    document.querySelectorAll(".section, #home")
        .forEach(el => el.classList.add("hidden"));

    document.getElementById(id).classList.remove("hidden");

    updateDropdowns();
    afficherHistorique();

    if (id === "sortie") resetSortie();
    if (id === "entree") resetEntree();
    if (id === "listeEquipements") afficherListeEquipements();
    if (id === "admin") afficherListeEquipementsAdmin();
}

// ==========================
// Reset entrée / sortie d'équipement
// ==========================

function resetSortie() {
    resetForm("sortie");
}

function resetEntree() {
    resetForm("entree");
}

// ==========================
// ADMIN
// ==========================

function adminAccess() {
    showSection("adminLogin");
}

function verifierAdmin() {

    const mdp = document.getElementById("adminPassword").value;

    if (mdp === "admin123") {
        document.getElementById("adminPassword").value = "";
        showSection("admin");
    } else {
        alert("Mot de passe incorrect");
    }
}

function ajouterEquipement() {

    let nom = document.getElementById("nomEquipement").value;
    let file = document.getElementById("photoEquipement").files[0];

    if (!nom || !file) return alert("Champs manquants");

    let reader = new FileReader();

    reader.onload = function (e) {

        let img = new Image();

        img.onload = function () {

            const maxSize = 800;

            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                }
            }

            let canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            let ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            let resized = canvas.toDataURL("image/jpeg", 0.8);

            equipements.push({
                nom: nom,
                photo: resized,
                statut: "stock"
            });

            saveData();
            updateDropdowns();
            afficherListeEquipementsAdmin();

            alert("Équipement ajouté ✔");

            document.getElementById("nomEquipement").value = "";
            document.getElementById("photoEquipement").value = "";
        };

        // 🔥 LIGNE MANQUANTE
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

function ajouterDestination() {
    let nom = document.getElementById("nomDestination").value;
    if (!nom) return;

    destinations.push(nom);
    saveData();
    updateDropdowns();
    afficherListeDestinations();
    alert("Destination ajoutée ✔");
    document.getElementById("nomDestination").value = "";
}

function ajouterUtilisateur() {
    let nom = document.getElementById("nomUtilisateur").value;
    if (!nom) return;

    utilisateurs.push(nom);
    saveData();
    updateDropdowns();
    afficherListeUtilisateurs();
    alert("Utilisateur ajouté ✔");
    document.getElementById("nomUtilisateur").value = "";
}

// ==========================
// DROPDOWNS
// ==========================

function updateDropdowns() {

    const destSortie = document.getElementById("destinationSortie");
    const userSortie = document.getElementById("utilisateurSortie");

    // Sécurité : si la page ne contient pas les selects, on ne fait rien
    if (!destSortie && !userSortie) return;

    // Destination
    if (destSortie) {
        destSortie.innerHTML = `<option value="">-- Sélectionner une destination --</option>`;
        destinations.forEach(destination => {
            destSortie.innerHTML += `<option>${destination}</option>`;
        });
    }

    // Utilisateur
    if (userSortie) {
        userSortie.innerHTML = `<option value="">-- Sélectionner un utilisateur --</option>`;
        utilisateurs.forEach(utilisateur => {
            userSortie.innerHTML += `<option>${utilisateur}</option>`;
        });
    }
}

// ==========================
// SORTIE / ENTREE
// ==========================

let equipementsSelectionnes = [];
let equipementsSelectionnesEntree = [];
let equipementChoisiIndex = null;
let equipementChoisiEntreeIndex = null;
let modeSelection = null;

function sortirEquipement() {

    const destination = document.getElementById("destinationSortie").value;
    const utilisateur = document.getElementById("utilisateurSortie").value;

    if (equipementsSelectionnes.length === 0 || !destination || !utilisateur) {
        alert("Champs manquants");
        return;
    }

    let date = new Date().toLocaleString("fr-FR", {
        timeZone: "Europe/Paris"
    });

    equipementsSelectionnes.forEach(index => {

        equipements[index].statut = "sortie";

        mouvements.push({
            type: "Sortie",
            equipement: equipements[index].nom,
            destination: destination,
            utilisateur: utilisateur,
            date: date
        });

    });

    saveData();
    updateDropdowns();
    afficherHistorique();
    resetSortie();

    equipementsSelectionnes = [];

    alert("Sortie enregistrée ✔");
}


function entrerEquipement() {

    if (equipementsSelectionnesEntree.length === 0) {
        alert("Aucun équipement sélectionné");
        return;
    }

    let date = new Date().toLocaleString("fr-FR", {
        timeZone: "Europe/Paris"
    });

    equipementsSelectionnesEntree.forEach(index => {

        equipements[index].statut = "stock";

        mouvements.push({
            type: "Entrée",
            equipement: equipements[index].nom,
            date: date
        });

    });

    saveData();
    updateDropdowns();
    afficherHistorique();
    resetEntree();

    equipementsSelectionnesEntree = [];

    alert("Entrée enregistrée ✔");
}

function verifierFormulaireEntree() {

    const bouton = document.getElementById("btnValiderEntree");

    if (equipementsSelectionnesEntree.length > 0) {
        bouton.disabled = false;
    } else {
        bouton.disabled = true;
    }
}

function verifierFormulaireSortie() {

    const destination = document.getElementById("destinationSortie").value;
    const utilisateur = document.getElementById("utilisateurSortie").value;
    const bouton = document.getElementById("btnValiderSortie");

    if (equipementsSelectionnes.length > 0 && destination && utilisateur) {
        bouton.disabled = false;
    } else {
        bouton.disabled = true;
    }
}

function ouvrirSelectionEquipement() {

modeSelection = "sortie";
    const popup = document.getElementById("popupEquipements");
    const grid = document.getElementById("popupGrid");

    grid.innerHTML = "";
    equipementsSelectionnes = [];

    equipements
        .filter(eq => eq.statut === "stock")
        .forEach((eq, indexOriginal) => {

            const index = equipements.indexOf(eq);

            let div = document.createElement("div");
            div.className = "equipement-item";

            div.innerHTML = `
                <img src="${eq.photo}" alt="${eq.nom}">
                <h4>${eq.nom}</h4>
                <small class="${eq.statut}">${eq.statut}</small>
            `;

            div.onclick = function () {

                if (equipementsSelectionnes.includes(index)) {
                    equipementsSelectionnes =
                        equipementsSelectionnes.filter(i => i !== index);
                    div.classList.remove("selected");
                } else {
                    equipementsSelectionnes.push(index);
                    div.classList.add("selected");
                }

                verifierFormulaireSortie();
            };

            grid.appendChild(div);
        });

    popup.classList.remove("hidden");
}


function fermerSelectionEquipement() {
    document.getElementById("popupEquipements").classList.add("hidden");
}


function afficherSelectionSortieMultiple() {

    const container = document.getElementById("equipementSelectionne");
    container.innerHTML = "";
    container.classList.remove("hidden");

    equipementsSelectionnes.forEach(index => {

        const eq = equipements[index];

        const carte = document.createElement("div");
        carte.className = "equipement-item";

        carte.innerHTML = `
            <img src="${eq.photo}" alt="${eq.nom}">
            <h4>${eq.nom}</h4>
            <small class="${eq.statut}">${eq.statut}</small>
        `;

        container.appendChild(carte);
    });
}

function selectionnerEquipement(index) {


    equipementChoisiIndex = index;

    const eq = equipements[index];

    document.getElementById("imageSelectionnee").src = eq.photo;
    document.getElementById("nomSelectionne").textContent = eq.nom;
    document.getElementById("equipementSelectionne").classList.remove("hidden");

    fermerSelectionEquipement();
    verifierFormulaireSortie();
}

function ouvrirSelectionEquipementEntree() {

modeSelection = "entree";
    const popup = document.getElementById("popupEquipements");
    const grid = document.getElementById("popupGrid");

    grid.innerHTML = "";
    equipementsSelectionnesEntree = [];

    equipements
        .filter(eq => eq.statut === "sortie")
        .forEach(eq => {

            const index = equipements.indexOf(eq);

            let div = document.createElement("div");
            div.className = "equipement-item";

            div.innerHTML = `
                <img src="${eq.photo}" alt="${eq.nom}">
                <h4>${eq.nom}</h4>
                <small class="${eq.statut}">${eq.statut}</small>
            `;

            div.onclick = function () {

                if (equipementsSelectionnesEntree.includes(index)) {
                    equipementsSelectionnesEntree =
                        equipementsSelectionnesEntree.filter(i => i !== index);
                    div.classList.remove("selected");
                } else {
                    equipementsSelectionnesEntree.push(index);
                    div.classList.add("selected");
                }

                verifierFormulaireEntree();
            };

            grid.appendChild(div);
        });

    popup.classList.remove("hidden");
}


function validerSelection() {

    if (modeSelection === "entree") {

        if (equipementsSelectionnesEntree.length === 0) {
            alert("Veuillez sélectionner au moins un équipement");
            return;
        }

        afficherSelectionEntreeMultiple();
        verifierFormulaireEntree();
    }

    if (modeSelection === "sortie") {

        if (equipementsSelectionnes.length === 0) {
            alert("Veuillez sélectionner au moins un équipement");
            return;
        }

        afficherSelectionSortieMultiple();
        verifierFormulaireSortie();
    }

    fermerSelectionEquipement();
}

function afficherSelectionEntreeMultiple() {

    const container = document.getElementById("equipementSelectionneEntree");
    container.innerHTML = "";
    container.classList.remove("hidden");

    equipementsSelectionnesEntree.forEach(index => {

        const eq = equipements[index];

        const carte = document.createElement("div");
        carte.className = "equipement-item";

        carte.innerHTML = `
            <img src="${eq.photo}" alt="${eq.nom}">
            <h4>${eq.nom}</h4>
            <small class="${eq.statut}">${eq.statut}</small>
        `;

        container.appendChild(carte);
    });
}

// ==========================
// OUTIL CONVERSION DATE FR
// ==========================

function convertirDateFR(dateStr) {

    let [datePart, timePart] = dateStr.split(" ");
    let [day, month, year] = datePart.split("/");

    return new Date(`${year}-${month}-${day}T${timePart}`);
}
// ==========================
// HISTORIQUE
// ==========================

function afficherHistorique() {

    const container = document.getElementById("historiqueContainer");
    if (!container) return;

    container.innerHTML = "";

    let mouvementsTries = [...mouvements].reverse();

    mouvementsTries.forEach(sortie => {

        if (sortie.type !== "Sortie") return;

        // Cherche une entrée APRÈS cette sortie (vraie comparaison de date)
        let entree = mouvements.find(m =>
            m.type === "Entrée" &&
            m.equipement === sortie.equipement &&
            convertirDateFR(m.date) > convertirDateFR(sortie.date)
        );

        const row = document.createElement("div");
        row.className = "history-row";

        const left = document.createElement("div");
        left.className = "history-left";

        const right = document.createElement("div");
        right.className = "history-right";

        // SORTIE
        left.innerHTML = `
            <strong>🔴 Sortie</strong><br>
            ${sortie.equipement}<br>
            ${sortie.destination}<br>
            ${sortie.utilisateur}<br>
            ${sortie.date}
        `;

        // ENTREE seulement si elle existe vraiment après
        if (entree) {
            right.innerHTML = `
                <strong>🟢 Entrée</strong><br>
                ${entree.equipement}<br>
                ${entree.date}
            `;
        } else {
            right.innerHTML = "&nbsp;";
        }

        row.appendChild(left);
        row.appendChild(right);
        container.appendChild(row);
    });
}
// ==========================
// Filtre HISTORIQUE
// ==========================

function filtrerNonRendus() {

    const container = document.getElementById("historiqueContainer");
    container.innerHTML = "";

    let mouvementsTries = [...mouvements].reverse();

    mouvementsTries.forEach(sortie => {

        if (sortie.type !== "Sortie") return;

        // Vérifie s'il existe une entrée après cette sortie
        let entreeTrouvee = mouvements.some(m =>
            m.type === "Entrée" &&
            m.equipement === sortie.equipement &&
            convertirDateFR(m.date) > convertirDateFR(sortie.date)
        );

        if (!entreeTrouvee) {

            const row = document.createElement("div");
            row.className = "history-row";

            const left = document.createElement("div");
            left.className = "history-left";

            const right = document.createElement("div");
            right.className = "history-right";

            left.innerHTML = `
                <strong>🔴 Toujours en sortie</strong><br>
                ${sortie.equipement}<br>
                ${sortie.destination}<br>
                ${sortie.utilisateur}<br>
                ${sortie.date}
            `;

            right.innerHTML = "&nbsp;";

            row.appendChild(left);
            row.appendChild(right);

            container.appendChild(row);
        }
    });
}
// ==========================
// LISTE EQUIPEMENTS
// ==========================

function afficherListeEquipements() {
    filtrerEquipements("all");
}

function filtrerEquipements(type, btn = null) {

    document.querySelectorAll(".filtre-btn")
        .forEach(b => b.classList.remove("active"));

    if (btn) btn.classList.add("active");

    let grid = document.getElementById("equipementsGrid");
    if (!grid) return;

    grid.innerHTML = "";

    let liste = equipements;

    if (type === "stock") {
        liste = equipements.filter(e => e.statut === "stock");
    }

    if (type === "sortie") {
        liste = equipements.filter(e => e.statut === "sortie");
    }

    liste.forEach(eq => {

        let div = document.createElement("div");
        div.className = "equipement-item";

        div.innerHTML = `
            <img src="${eq.photo}" alt="${eq.nom}">
            <h4>${eq.nom}</h4>
            <small class="${eq.statut}">${eq.statut}</small>
        `;

        grid.appendChild(div);
    });
}

// ==========================
// ADMIN LISTE
// ==========================

function ouvrirAdminSection(section) {

    document.querySelectorAll(".admin-section")
        .forEach(sec => sec.classList.add("hidden"));

    document.getElementById("admin-" + section)
        .classList.remove("hidden");

    if (section === "equipements") {
        afficherListeEquipementsAdmin();
    }

    if (section === "destinations") {
        afficherListeDestinations();
    }

    if (section === "utilisateurs") {
        afficherListeUtilisateurs();
    }
}

function afficherListeDestinations() {

    const ul = document.getElementById("listeDestinations");
    ul.innerHTML = "";

    destinations.forEach((dest, index) => {

        let li = document.createElement("li");
        li.innerHTML = `
            ${dest}
            <button onclick="supprimerDestination(${index})">
                Supprimer
            </button>
        `;

        ul.appendChild(li);
    });
}

function supprimerDestination(index) {

    if (!confirm("Supprimer cette destination ?")) return;

    destinations.splice(index, 1);
    saveData();
    updateDropdowns();
    afficherListeDestinations();
}

function afficherListeUtilisateurs() {

    const ul = document.getElementById("listeUtilisateurs");
    ul.innerHTML = "";

    utilisateurs.forEach((user, index) => {

        let li = document.createElement("li");
        li.innerHTML = `
            ${user}
            <button onclick="supprimerUtilisateur(${index})">
                Supprimer
            </button>
        `;

        ul.appendChild(li);
    });
}

function supprimerUtilisateur(index) {

    if (!confirm("Supprimer cet utilisateur ?")) return;

     utilisateurs.splice(index, 1);
     saveData();
     updateDropdowns();
     afficherListeUtilisateurs();
}

function afficherListeEquipementsAdmin() {

    let grid = document.getElementById("equipementsAdminGrid");
    if (!grid) return;

    grid.innerHTML = "";

    equipements.forEach((eq, index) => {

        let div = document.createElement("div");
        div.className = "equipement-item";

        div.innerHTML = `
            <img src="${eq.photo}" alt="${eq.nom}">
            <h4>${eq.nom}</h4>
            <small>${eq.statut}</small>
            <button onclick="supprimerEquipement(${index})">Supprimer</button>
        `;

        grid.appendChild(div);
    });
}

function supprimerEquipement(index) {

    if (!confirm("Supprimer cet équipement ?")) return;

    equipements.splice(index, 1);
    saveData();
    updateDropdowns();
    afficherListeEquipementsAdmin();
}

function afficherPhotoSortie() {

    const select = document.getElementById("equipementSortie");
    const preview = document.getElementById("photoSortiePreview");

    if (!select || select.value === "") {
        preview.style.display = "none";
        return;
    }

    const index = select.value;
    const equipement = equipements[index];

    if (equipement && equipement.photo) {
        preview.src = equipement.photo;
        preview.style.display = "block";
    } else {
        preview.style.display = "none";
    }
}

// ==========================
// RESET GLOBAL UNIVERSEL
// ==========================

function resetForm(section) {

    // Réinitialise tableaux sélection
    equipementsSelectionnes = [];
    equipementsSelectionnesEntree = [];
    equipementChoisiIndex = null;
    equipementChoisiEntreeIndex = null;

    // Vide tous les inputs texte
    document.querySelectorAll(`#${section} input[type="text"]`)
        .forEach(input => input.value = "");

    // Vide les selects
    document.querySelectorAll(`#${section} select`)
        .forEach(select => select.value = "");

    // Cache blocs sélection équipements
    const blocSortie = document.getElementById("equipementSelectionne");
    const blocEntree = document.getElementById("equipementSelectionneEntree");

    if (blocSortie) {
        blocSortie.innerHTML = "";
        blocSortie.classList.add("hidden");
    }

    if (blocEntree) {
        blocEntree.innerHTML = "";
        blocEntree.classList.add("hidden");
    }

    // Désactive tous les boutons valider
    document.querySelectorAll(`#${section} .primary`)
        .forEach(btn => btn.disabled = true);
}
