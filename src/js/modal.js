import { loadCommentsForPost, addComment } from '../js/comments2.js';
import { auth } from '../js/firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    // Gestion des modales
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');
    const publishBtn = document.getElementById('publish-btn');
    const publishModal = document.getElementById('modal_publish');

    // Fermeture des modales
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Clic en dehors des modales
    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Ouverture de la modale de publication
    if (publishBtn && publishModal) {
        publishBtn.addEventListener('click', () => {
            publishModal.classList.add('active');
        });
    }

    // Configuration de la modale des commentaires
    const commentModal = document.getElementById('modal-comment-accueil');
    if (!commentModal) return; // Sortir si la modal n'existe pas sur cette page

    const commentForm = commentModal.querySelector('.comment-form');
    const commentsList = commentModal.querySelector('.comments-list');
    const commentTextarea = commentModal.querySelector('textarea');
    const sendButton = commentModal.querySelector('.send-comment');

    // Clic en dehors de la modal
    window.addEventListener('click', (e) => {
        if (e.target === commentModal) {
            commentModal.classList.remove('active');
        }
    });

    if (sendButton) {
        sendButton.addEventListener('click', async () => {
            const commentText = commentTextarea.value;
            if (commentText.trim()) {
                const postId = commentModal.dataset.postId;
                const currentUser = auth.currentUser;
                
                if (postId && currentUser) {
                    await addComment(postId, commentText, currentUser.displayName || 'Utilisateur anonyme');
                    commentTextarea.value = '';
                }
            }
        });
    }

    // Écouter l'événement de chargement des commentaires
    window.addEventListener('loadComments', (event) => {
        const postId = event.detail.postId;
        if (postId) {
            loadCommentsForPost(postId);
        }
    });
}); 