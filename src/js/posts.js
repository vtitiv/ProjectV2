import { collection, getDocs, addDoc, onSnapshot, doc, getDoc, deleteDoc, serverTimestamp, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from './firebase-config.js';
import { displayPosts } from './components/affichage_card.js';

// Déclaration des variables globales
let postsContainer;
let currentUser;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initialisation de posts.js');
    
    // Récupérer les éléments du DOM
    postsContainer = document.querySelector('.posts-container');
    currentUser = JSON.parse(localStorage.getItem('user'));

    console.log('Container des posts:', postsContainer);
    console.log('Utilisateur actuel:', currentUser);

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
        console.log('Mise en place de l\'écouteur Firebase');
        const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
            console.log('Changements détectés dans les posts');
            const posts = [];
            snapshot.forEach((doc) => {
                const post = { id: doc.id, ...doc.data() };
                console.log('Post récupéré:', post);
                posts.push(post);
            });
            console.log('Posts récupérés:', posts);

            // Utiliser la fonction displayPosts avec les handlers
            displayPosts(posts, postsContainer, currentUser, false, {
                onLike: handleLike,
                onComment: openCommentModal
            });
        });

        // Gestion du formulaire de création de post
        const postForm = document.getElementById('post-form');
        if (postForm) {
            console.log('Formulaire de post trouvé, ajout du gestionnaire d\'événements');
            postForm.addEventListener('submit', handlePostSubmit);
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        postsContainer.innerHTML = '<p class="error">Une erreur est survenue lors de l\'initialisation.</p>';
    }
});

// Fonction pour gérer la soumission d'un nouveau post
async function handlePostSubmit(event) {
    event.preventDefault();
    console.log('Début de la soumission du post');

    try {
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();
        const hashtagsInput = document.getElementById('post-hashtags').value.trim();
        const category = document.getElementById('post-category').value;
        const visibility = document.getElementById('post-visibility').value;

        // Validation
        if (!title || !content || !category) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        // Traitement des hashtags
        const hashtags = hashtagsInput 
            ? hashtagsInput.split(/[\s,]+/)
                .map(tag => tag.trim())
                .filter(tag => tag)
                .map(tag => tag.startsWith('#') ? tag : '#' + tag)
            : [];

        const newPost = {
            userId: currentUser.uid,
            username: currentUser.displayName || 'Anonyme',
            title,
            text: content,
            hashtags,
            category,
            visibility,
            createdAt: serverTimestamp(),
            likes: [],
            comments: []
        };

        // Sauvegarder le post dans Firebase
        const docRef = await addDoc(collection(db, 'projects'), newPost);
        console.log('Post créé avec ID:', docRef.id);

        // Réinitialiser le formulaire et fermer la modal
        const form = document.getElementById('post-form');
        if (form) {
            form.reset();
        }
        const modal = document.getElementById('modal_publish');
        if (modal) {
            modal.classList.remove('active');
        }

        // Afficher un message de succès
        alert('Publication créée avec succès !');
    } catch (error) {
        console.error('Erreur lors de la création du post:', error);
        alert('Une erreur est survenue lors de la création du post.');
    }
}

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