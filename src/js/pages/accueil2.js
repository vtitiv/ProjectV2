import { collection, onSnapshot, doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from '../firebase-config.js';
import { displayPosts } from '../components/affichage_card.js';

// Variables globales
let postsContainer;
let currentUser;

// Fonction pour gérer les likes
async function handleLike(postId) {
    try {
        const postRef = doc(db, 'projects', postId);
        const postDoc = await getDoc(postRef);
        
        if (postDoc.exists()) {
            const post = postDoc.data();
            const likes = post.likes || [];
            const userIndex = likes.indexOf(currentUser.uid);
            
            if (userIndex === -1) {
                // Ajouter le like
                likes.push(currentUser.uid);
            } else {
                // Retirer le like
                likes.splice(userIndex, 1);
            }
            
            await updateDoc(postRef, { likes });
        }
    } catch (error) {
        console.error('Erreur lors de la gestion du like:', error);
        alert('Une erreur est survenue lors de la gestion du like.');
    }
}

// Fonction pour ouvrir la modal des commentaires
function openCommentModal(postId) {
    const modal = document.getElementById('modal-comment-accueil');
    if (modal) {
        modal.classList.add('active');
        modal.dataset.postId = postId;
        window.dispatchEvent(new CustomEvent('loadComments', { detail: { postId } }));
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initialisation de la page accueil2');
    
    // Récupérer les éléments du DOM
    postsContainer = document.querySelector('.posts-container');
    currentUser = JSON.parse(localStorage.getItem('user'));

    // Vérifier si l'utilisateur est connecté
    if (!currentUser) {
        console.log('Utilisateur non connecté, redirection vers login');
        window.location.href = '/login';
        return;
    }

    // Vérifier si le container existe
    if (!postsContainer) {
        console.error('Container de posts non trouvé');
        return;
    }

    try {
        // Écouter les changements de posts en temps réel
        const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
            const posts = [];
            snapshot.forEach((doc) => {
                const post = { id: doc.id, ...doc.data() };
                posts.push(post);
            });
            
            // Afficher les posts avec les handlers
            displayPosts(posts, postsContainer, currentUser, false, {
                onLike: handleLike,
                onComment: openCommentModal
            });
        });
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        postsContainer.innerHTML = '<p class="error">Une erreur est survenue lors de l\'initialisation.</p>';
    }
}); 