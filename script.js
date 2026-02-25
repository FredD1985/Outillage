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

function resetSortie() {

    equipementChoisiIndex = null;

    let dest = document.getElementById("destinationSortie");
    let user = document.getElementById("utilisateurSortie");

    if (dest) dest.value = "";
    if (user) user.value = "";

    // Cache l'affichage équipement sélectionné
    const bloc = document.getElementById("equipementSelectionne");
    const image = document.getElementById("imageSelectionnee");
    const nom = document.getElementById("nomSelectionne");

    if (bloc) bloc.classList.add("hidden");
    if (image) image.src = "";
    if (nom) nom.textContent = "";

    verifierFormulaireSortie();
}

// ==========================
// entré d'équipement
// ==========================

function resetEntree() {

    equipementChoisiEntreeIndex = null;

    const bloc = document.getElementById("equipementSelectionneEntree");
    const image = document.getElementById("imageSelectionneeEntree");
    const nom = document.getElementById("nomSelectionneEntree");
    const bouton = document.getElementById("btnValiderEntree");

    if (bloc) bloc.classList.add("hidden");
    if (image) image.src = "";
    if (nom) nom.textContent = "";
    if (bouton) bouton.disabled = true;
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

            let canvas = document.createElement("canvas");
            canvas.width = 250;
            canvas.height = 250;

            let ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, 250, 250);

            let resized = canvas.toDataURL();

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

    let equipEntree = document.getElementById("equipementEntree");
    let destSortie = document.getElementById("destinationSortie");
    let userSortie = document.getElementById("utilisateurSortie");

    // Dropdown entrée uniquement
    if (equipEntree) {

        equipEntree.innerHTML = `<option value="">-- Sélectionner un équipement --</option>`;

        equipements.forEach((e, i) => {
            if (e.statut === "sortie") {
                equipEntree.innerHTML += `<option value="${i}">${e.nom}</option>`;
            }
        });
    }

    // Destination
    if (destSortie) {
        destSortie.innerHTML = `<option value="">-- Sélectionner une destination --</option>`;
        destinations.forEach(d => {
            destSortie.innerHTML += `<option>${d}</option>`;
        });
    }

    // Utilisateur
    if (userSortie) {
        userSortie.innerHTML = `<option value="">-- Sélectionner un utilisateur --</option>`;
        utilisateurs.forEach(u => {
            userSortie.innerHTML += `<option>${u}</option>`;
        });
    }
}

// ==========================
// SORTIE / ENTREE
// ==========================

let equipementChoisiIndex = null;
let equipementChoisiEntreeIndex = null;

function sortirEquipement() {

    const equipementIndex = equipementChoisiIndex;
    const destination = document.getElementById("destinationSortie").value;
    const utilisateur = document.getElementById("utilisateurSortie").value;

    // Vérification champs vides avec animation
    if (equipementIndex === null || !destination || !utilisateur) {

    ["destinationSortie", "utilisateurSortie"]
    .forEach(id => {
        const field = document.getElementById(id);
        if (!field.value) {
            field.classList.add("error-field");
            setTimeout(() => field.classList.remove("error-field"), 500);
        }
    });

    if (equipementIndex === null) {
        alert("Veuillez choisir un équipement");
    }

    return;
}
    const equipementNom = equipements[equipementIndex].nom;

 // Vérifie le dernier mouvement de cet équipement
    let mouvementsEquipement = mouvements
    .filter(m => m.equipement === equipementNom)
    .sort((a, b) => convertirDateFR(b.date) - convertirDateFR(a.date));

    let dernierMouvement = mouvementsEquipement[0];

   if (dernierMouvement && dernierMouvement.type === "Sortie") {
    alert("Cet équipement est déjà en sortie.");
    return;
    }

    let date = new Date().toLocaleString("fr-FR", {
        timeZone: "Europe/Paris"
    });

    equipements[equipementIndex].statut = "sortie";

    mouvements.push({
        type: "Sortie",
        equipement: equipementNom,
        destination: destination,
        utilisateur: utilisateur,
        date: date
    });

    saveData();
    updateDropdowns();
    afficherHistorique();
    resetSortie();
    verifierFormulaireSortie();

    alert("Sortie enregistrée ✔");
}
function entrerEquipement() {

    if (equipementChoisiEntreeIndex === null) return;

    let i = equipementChoisiEntreeIndex;

    let date = new Date().toLocaleString("fr-FR", {
        timeZone: "Europe/Paris"
    });

    equipements[i].statut = "stock";

    mouvements.push({
        type: "Entrée",
        equipement: equipements[i].nom,
        date: date
    });

    saveData();
    afficherHistorique();
    resetEntree();

    alert("Entrée enregistrée ✔");
}

function verifierFormulaireSortie() {

    const destination = document.getElementById("destinationSortie").value;
    const utilisateur = document.getElementById("utilisateurSortie").value;
    const bouton = document.getElementById("btnValiderSortie");

    if (equipementChoisiIndex !== null && destination && utilisateur) {
        bouton.disabled = false;
    } else {
        bouton.disabled = true;
    }
}

function ouvrirSelectionEquipement() {

    const popup = document.getElementById("popupEquipements");
    const grid = document.getElementById("popupGrid");

    grid.innerHTML = "";

    equipements.forEach((eq, index) => {

        if (eq.statut !== "stock") return;

        let div = document.createElement("div");
        div.className = "equipement-item";

        div.innerHTML = `
            <img src="${eq.photo}">
            <h4>${eq.nom}</h4>
        `;

        div.onclick = function () {
            selectionnerEquipement(index);
        };

        grid.appendChild(div);
    });

    popup.classList.remove("hidden");
}

function fermerSelectionEquipement() {
    document.getElementById("popupEquipements").classList.add("hidden");
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

    const popup = document.getElementById("popupEquipements");
    const grid = document.getElementById("popupGrid");

    grid.innerHTML = "";

    equipements.forEach((eq, index) => {

        if (eq.statut !== "sortie") return;

        let div = document.createElement("div");
        div.className = "equipement-item";

        div.innerHTML = `
            <img src="${eq.photo}">
            <h4>${eq.nom}</h4>
        `;

        div.onclick = function () {
            selectionnerEquipementEntree(index);
        };

        grid.appendChild(div);
    });

    popup.classList.remove("hidden");
}
function selectionnerEquipementEntree(index) {

    equipementChoisiEntreeIndex = index;

    const eq = equipements[index];

    document.getElementById("imageSelectionneeEntree").src = eq.photo;
    document.getElementById("nomSelectionneEntree").textContent = eq.nom;
    document.getElementById("equipementSelectionneEntree").classList.remove("hidden");

    document.getElementById("btnValiderEntree").disabled = false;

    fermerSelectionEquipement();
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
            <small>${eq.statut}</small>
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
