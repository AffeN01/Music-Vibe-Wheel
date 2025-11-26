let genreData = [];
let filteredIndices = []; // Stores indices of enabled genres

const spinBtn = document.getElementById('spinBtn');
const filterBtn = document.getElementById('filterBtn');
const resultCard = document.getElementById('resultCard');
const genreTitle = document.getElementById('genreTitle');
const vibeDesc = document.getElementById('vibeDesc');
const artistList = document.getElementById('artistList');
const paletteList = document.getElementById('paletteList');
const linkYoutube = document.getElementById('linkYoutube');
const linkSimilar = document.getElementById('linkSimilar');

// Modal Elements
const filterModal = document.getElementById('filterModal');
const checkboxGrid = document.getElementById('checkboxGrid');

// Fetch JSON on load
async function loadVibes() {
    try {
        const response = await fetch('vibes.json');
        if (!response.ok) throw new Error("Failed to load vibes.json");
        genreData = await response.json();
        
        // Init: All genres enabled
        filteredIndices = genreData.map((_, index) => index);
        
        // Build Modal
        buildFilterModal();

        spinBtn.innerText = "🎲 Inspire Me";
        spinBtn.disabled = false;
        filterBtn.disabled = false;
    } catch (error) {
        console.error(error);
        spinBtn.innerText = "Error Loading Data";
        resultCard.style.display = 'block';
        genreTitle.innerText = "Load Error";
        vibeDesc.innerText = "Could not load 'vibes.json'. Check if your local server is running.";
    }
}

window.addEventListener('DOMContentLoaded', loadVibes);

// --- FILTER LOGIC ---

function toggleModal(show) {
    filterModal.style.display = show ? 'flex' : 'none';
}

filterBtn.addEventListener('click', () => toggleModal(true));

function buildFilterModal() {
    checkboxGrid.innerHTML = '';
    genreData.forEach((item, index) => {
        const wrapper = document.createElement('label');
        wrapper.className = 'checkbox-item';
        
        const box = document.createElement('input');
        box.type = 'checkbox';
        box.checked = true; // Default checked
        box.dataset.index = index;
        
        // Event Listener to update list in real-time
        box.addEventListener('change', updateFilteredList);

        const label = document.createElement('span');
        label.innerText = item.genre;

        wrapper.appendChild(box);
        wrapper.appendChild(label);
        checkboxGrid.appendChild(wrapper);
    });
}

function updateFilteredList() {
    const boxes = document.querySelectorAll('#checkboxGrid input[type="checkbox"]');
    filteredIndices = [];
    boxes.forEach(box => {
        if (box.checked) {
            filteredIndices.push(parseInt(box.dataset.index));
        }
    });
}

// Make these global so they work with onclick in HTML
window.toggleModal = toggleModal;
window.toggleAll = function(state) {
    const boxes = document.querySelectorAll('#checkboxGrid input[type="checkbox"]');
    boxes.forEach(box => box.checked = state);
    updateFilteredList();
};

// --- RENDER LOGIC ---

function renderCard(data) {
    genreTitle.innerText = data.genre;
    vibeDesc.innerText = data.vibe;
    
    artistList.innerHTML = '';
    paletteList.innerHTML = '';

    if (data.artists) {
        data.artists.forEach(artist => {
            const tag = document.createElement('a');
            tag.className = 'tag artist';
            tag.innerText = artist;
            tag.href = `https://youtube.com/results?search_query=${encodeURIComponent(artist)}`;
            tag.target = "_blank"; 
            artistList.appendChild(tag);
        });
    }

    if (data.palette) {
        data.palette.forEach(item => {
            const tag = document.createElement('span');
            tag.className = 'tag instrument';
            tag.innerText = item;
            paletteList.appendChild(tag);
        });
    }

    const mainArtist = data.artists && data.artists.length > 0 ? data.artists[0] : "";
    linkYoutube.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(data.genre + " type beat mix")}`;
    linkSimilar.href = `https://www.music-map.com/${encodeURIComponent(mainArtist)}`;
    linkSimilar.innerHTML = `🕸️ Find Similar to ${mainArtist}`;
}

function pickRandom() {
    if (genreData.length === 0) return;
    
    if (filteredIndices.length === 0) {
        alert("You deselected every genre! Please enable at least one in the Filter menu.");
        return;
    }

    spinBtn.disabled = true;
    spinBtn.innerText = "Scanning...";
    
    resultCard.style.display = 'block';
    resultCard.classList.add('shuffling');

    let iterations = 0;
    const maxIterations = 15;

    const interval = setInterval(() => {
        // Pick a random INDEX from the FILTERED list
        const randomIndex = filteredIndices[Math.floor(Math.random() * filteredIndices.length)];
        renderCard(genreData[randomIndex]);
        iterations++;

        if (iterations >= maxIterations) {
            clearInterval(interval);
            finalizeSelection();
        }
    }, 80);
}

function finalizeSelection() {
    const randomIndex = filteredIndices[Math.floor(Math.random() * filteredIndices.length)];
    renderCard(genreData[randomIndex]);
    
    resultCard.classList.remove('shuffling');
    spinBtn.disabled = false;
    spinBtn.innerText = "🎲 Inspire Me Again";
}

spinBtn.addEventListener('click', pickRandom);