import { createCard } from './card.js';

export function displayPosts(posts, container, currentUser, isProfilePage, handlers) {
    console.log('Début de l\'affichage des posts');
    console.log('isProfilePage:', isProfilePage);
    console.log('handlers:', handlers);

    // Vider le conteneur
    container.innerHTML = '';

    // Filtrer les posts selon la visibilité
    const filteredPosts = isProfilePage ? 
        posts : 
        posts.filter(post => post.visibility === 'public');
    console.log('Posts filtrés:', filteredPosts);

    // Trier les posts par date (du plus récent au plus ancien)
    const sortedPosts = filteredPosts.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
        return dateB - dateA;
    });
    console.log('Posts triés par date:', sortedPosts);

    // Créer et ajouter les cartes
    console.log('Début de la création des cartes');
    sortedPosts.forEach((post, index) => {
        console.log(`Création de la carte ${index + 1}/${sortedPosts.length} pour le post:`, post);
        console.log('Page profil:', isProfilePage);
        
        const card = createCard(post, isProfilePage, {
            currentUserId: currentUser.uid,
            ...handlers
        });
        console.log('Carte créée avec succès');
        
        container.appendChild(card);
        console.log('Carte ajoutée au container');
    });

    console.log('Affichage des posts terminé');
} 