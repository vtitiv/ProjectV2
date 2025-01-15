import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from './firebase-config.js';

let posts = [];
let searchTimeout;

// Fonction pour récupérer tous les posts
async function fetchPosts() {
    try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        posts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Afficher tous les posts au chargement
        displayAllPosts();
    } catch (error) {
        console.error("Erreur lors de la récupération des posts:", error);
    }
}

// Fonction de recherche
function searchPosts(searchTerm, filters) {
    if (!searchTerm) {
        displayAllPosts();
        return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filteredPosts = posts.filter(post => {
        let matchFound = false;

        if (filters.title && post.title) {
            matchFound = matchFound || post.title.toLowerCase().includes(searchTermLower);
        }

        if (filters.content && post.text) {
            matchFound = matchFound || post.text.toLowerCase().includes(searchTermLower);
        }

        if (filters.hashtags && post.hashtags) {
            matchFound = matchFound || post.hashtags.some(tag => 
                tag.toLowerCase().includes(searchTermLower)
            );
        }

        return matchFound && post.visibility === 'public';
    });

    displayFilteredPosts(filteredPosts);
}

// Fonction pour afficher les posts filtrés
function displayFilteredPosts(filteredPosts) {
    const postsContainer = document.querySelector('.posts-container');
    if (!postsContainer) {
        console.error("Container de posts non trouvé");
        return;
    }

    if (filteredPosts.length === 0) {
        postsContainer.innerHTML = '<p class="no-results">Aucun résultat trouvé</p>';
        return;
    }

    postsContainer.innerHTML = filteredPosts
        .map(post => createPostHTML(post))
        .join('');
}

// Fonction pour afficher tous les posts
function displayAllPosts() {
    const postsContainer = document.querySelector('.posts-container');
    if (!postsContainer) {
        console.error("Container de posts non trouvé");
        return;
    }

    const publicPosts = posts.filter(post => post.visibility === 'public');
    
    if (publicPosts.length === 0) {
        postsContainer.innerHTML = '<p class="no-results">Aucun post disponible</p>';
        return;
    }

    postsContainer.innerHTML = publicPosts
        .map(post => createPostHTML(post))
        .join('');
}

// Fonction pour créer le HTML d'un post
function createPostHTML(post) {
    return `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <h2>${post.title || 'Sans titre'}</h2>
                <span class="post-date">${new Date(post.timestamp).toLocaleDateString()}</span>
            </div>
            <div class="post-content">
                <p>${post.text}</p>
            </div>
            ${post.hashtags ? `
                <div class="post-hashtags">
                    ${post.hashtags.map(tag => `<span class="hashtag">#${tag}</span>`).join(' ')}
                </div>
            ` : ''}
        </div>
    `;
}

// Initialisation des écouteurs d'événements
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Initialisation de la recherche...");
    
    const searchInput = document.getElementById('search-input');
    const titleCheckbox = document.getElementById('search-title');
    const contentCheckbox = document.getElementById('search-content');
    const hashtagsCheckbox = document.getElementById('search-hashtags');
    const toggleFiltersBtn = document.getElementById('toggle-filters');
    const clearSearchBtn = document.getElementById('clear-search');
    const searchFilters = document.querySelector('.search-filters');

    if (!searchInput || !titleCheckbox || !contentCheckbox || !hashtagsCheckbox || !toggleFiltersBtn || !clearSearchBtn || !searchFilters) {
        console.error("Certains éléments de recherche n'ont pas été trouvés");
        return;
    }

    // Charger les posts au démarrage
    await fetchPosts();

    // Fonction pour gérer la recherche
    function handleSearch() {
        console.log("Recherche en cours...");
        const searchTerm = searchInput.value;
        const filters = {
            title: titleCheckbox.checked,
            content: contentCheckbox.checked,
            hashtags: hashtagsCheckbox.checked
        };

        // Vérifier qu'au moins un filtre est activé
        if (!filters.title && !filters.content && !filters.hashtags) {
            alert('Veuillez sélectionner au moins un critère de recherche');
            return;
        }

        searchPosts(searchTerm, filters);
    }

    // Fonction pour effacer la recherche
    function clearSearch() {
        console.log("Effacement de la recherche");
        searchInput.value = '';
        handleSearch();
    }

    // Fonction pour basculer l'affichage des filtres
    function toggleFilters(event) {
        event.preventDefault(); // Empêcher le comportement par défaut
        console.log("Basculement des filtres");
        searchFilters.style.display = searchFilters.style.display === 'none' ? 'flex' : 'none';
        toggleFiltersBtn.classList.toggle('active');
    }

    // Écouteur pour le champ de recherche avec debounce
    searchInput.addEventListener('input', () => {
        console.log("Input détecté");
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(handleSearch, 300);
    });

    // Écouteurs pour les checkboxes
    [titleCheckbox, contentCheckbox, hashtagsCheckbox].forEach(checkbox => {
        checkbox.addEventListener('change', handleSearch);
    });

    // Écouteur pour le bouton de suppression
    clearSearchBtn.addEventListener('click', clearSearch);

    // Écouteur pour le bouton des filtres
    toggleFiltersBtn.addEventListener('click', toggleFilters);
}); 