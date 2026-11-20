// =====================================================================
// main.js — State, initialization & all event listeners
// =====================================================================
import { getCreatures, research, filterByType, postCreature} from "./api.js";
import { setData, getData } from "./storage.js";
import {
    renderCards,
    renderDetail,
    renderDetailEmpty,
    renderTeam,
    idValidation,
    nameValidation,
    attackValidation,
    defenceValidation,
    imgValidation,
    descriptionValidation,
    levelValidation
} from "./ui.js";

// -------------------------------------------------------------
// State
// -------------------------------------------------------------
let myTeam = [];
let allCreatures = [];
let favorits = getData("favorits") || [];
let currentType = getData("currentType") || "tous";

// -------------------------------------------------------------
// DOM references
// -------------------------------------------------------------
const cardsContainer = document.querySelector(".cards-container");
const detailSection = document.getElementById("detail");
const filtersContainer = document.querySelector("#filters");
const rech = document.querySelector("#search");
const teamSection = document.getElementById("team");
const form = document.querySelector("#creature-form");

// -------------------------------------------------------------
// Init — fetch creatures & first render
// -------------------------------------------------------------
allCreatures = await getCreatures();
document.getElementById("creature-count").textContent = `${allCreatures.length}`;

function init(creatures) {
    renderCards(creatures, favorits, cardsContainer);
}

renderTeam(myTeam);

// Apply saved filter on load
async function applyFilter(type) {
    // Highlight the matching button
    document.querySelectorAll('.type-btn').forEach(btn =>
        btn.classList.remove('bg-ink', 'text-white', 'border-ink'));
    const activeBtn = document.querySelector(`.type-btn[data-type="${type}"]`);
    if (activeBtn) activeBtn.classList.add('bg-ink', 'text-white', 'border-ink');

    if (type === "tous") {
        init(allCreatures);
    } else {
        try {
            const filtered = await filterByType(type);
            init(filtered);
        } catch (err) {
            console.error("Filter failed:", err);
            init(allCreatures);
        }
    }
}

await applyFilter(currentType);

// -------------------------------------------------------------
// 1. TYPE FILTER
// -------------------------------------------------------------
filtersContainer.addEventListener("click", async (event) => {
    const clickedBtn = event.target.closest('.type-btn');
    if (!clickedBtn) return;

    currentType = clickedBtn.dataset.type;
    setData("currentType", currentType);

    await applyFilter(currentType);
});

// -------------------------------------------------------------
// 2. CARDS GRID — detail, add-to-team, favorite
// -------------------------------------------------------------
cardsContainer.addEventListener('click', (event) => {
    const addBtn = event.target.closest('.add-to-team-button');
    if (addBtn) {
        event.stopPropagation();
        const creatureId = addBtn.dataset.id;
        const foundedCreature = allCreatures.find((creature) => String(creature.id) === String(creatureId));
        
        if (!foundedCreature) return;

        if (myTeam.length >= 6) {
            alert("Votre equipe est complete (6/6 max)");
            return;
        }

        const alreadyExists = myTeam.some((creature) => String(creature.id) === String(creatureId));
        if (alreadyExists) {
            alert("cette creature est deja dans votre equipe");
            return;
        }

        myTeam.push(foundedCreature);
        renderTeam(myTeam);
        return;
    }

    const favorBtn = event.target.closest(".star-icon");
    if (favorBtn) {
        event.stopPropagation();
        const creatureId = favorBtn.dataset.id;
        const foundedCreature = allCreatures.find((creature) => String(creature.id) === String(creatureId));
        
        if (!foundedCreature) return;

        const index = favorits.findIndex((creature) => String(creature.id) === String(creatureId));
        
        const imgElement = favorBtn.querySelector("img");

        if (index > -1) {
            favorits.splice(index, 1);
            if (imgElement) imgElement.src = "resources/empty-star.png";
            console.log(favorits);
        } else {
            favorits.push(foundedCreature);
            if (imgElement) imgElement.src = "resources/filled-star.png";
            console.log(favorits);
        }
        setData("favorits", favorits);
        return;
    }

    const card = event.target.closest('.poke-card');
    if (!card) return;

    const creatureId = Number(card.getAttribute('data-id'));
    const creature = allCreatures.find(c => Number(c.id) === creatureId);
    if (!creature) return;

    renderDetail(creature, detailSection);
});

// -------------------------------------------------------------
// 3. DETAIL PANEL — close button
// -------------------------------------------------------------
detailSection.addEventListener('click', (event) => {
    const closeBtn = event.target.closest('#back-btn');
    if (!closeBtn) return;

    renderDetailEmpty(detailSection);
});

// -------------------------------------------------------------
// 4. TEAM — remove member
// -------------------------------------------------------------
if (teamSection) {
    teamSection.addEventListener('click', (event) => {
        const removeBtn = event.target.closest('.remove-team-btn');
        if (!removeBtn) return;

        const creatureId = removeBtn.dataset.id;
        myTeam = myTeam.filter(c => String(c.id) !== String(creatureId));
        renderTeam(myTeam);
    });
}

// -------------------------------------------------------------
// 5. SEARCH
// -------------------------------------------------------------
if (rech) {
    rech.addEventListener('keydown', async (e) => {
        if (e.key === "Enter") {
            const text = rech.value.toLowerCase().trim();
            if (!text) {
                init(allCreatures);
                return;
            }
            const creature = await research(text);
            if (creature) {
                init([creature]);
            }
        }
    });
}

// -------------------------------------------------------------
// 6. CREATION FORM — validation & submit
// -------------------------------------------------------------
if (form) {
    form.addEventListener("input", function (e) {
        const field = e.target.id;
        if (field === "id") idValidation(allCreatures);
        if (field === "name") nameValidation();
        if (field === "attack") attackValidation();
        if (field === "defence") defenceValidation();
        if (field === "img") imgValidation();
        if (field === "description") descriptionValidation();
        if (e.target.classList.contains("level")) levelValidation();
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const idOk = idValidation(allCreatures);
        const nameOk = nameValidation();
        const attackOk = attackValidation();
        const defenceOk = defenceValidation();
        const imgOk = imgValidation();
        const levelOk = levelValidation();
        const descriptionOk = descriptionValidation();

        if (idOk && nameOk && attackOk && defenceOk && imgOk && levelOk && descriptionOk) {
            const newCreature = {
                id: document.querySelector("#id").value.trim(),
                name: document.querySelector("#name").value.trim(),
                primaryType: document.querySelector("[name='type']").value,
                level: "Niveau " + document.querySelector(".level").value.trim(),
                image: document.querySelector("#img").value.trim(),
                //description: document.querySelector("#description").value.trim(),
                HP: 50,
                ATTACK: Number(document.querySelector("#attack")?.value || 50),
                DEFENCE: Number(document.querySelector("#defence")?.value || 50)
            };
            const response = await postCreature(newCreature);
            allCreatures = await getCreatures();
            init(allCreatures);
            form.reset();
        }
    });
}
