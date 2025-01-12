import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, onSnapshot, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { updateEmail, updatePassword, updateProfile } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { db, auth, storage } from './firebase-config.js';
import { displayPosts } from './components/affichage_card.js';

// Variables globales
let currentUser;
let postsContainer;
let unsubscribeListener = null;

// Fonction pour gérer l'upload de photo
async function handlePhotoUpload(file) {
    try {
        console.log('Début de handlePhotoUpload avec le fichier:', file);
        
        if (!storage) {
            throw new Error('Firebase Storage n\'est pas initialisé');
        }

        if (!auth.currentUser) {
            throw new Error('Utilisateur non connecté');
        }

        if (!file || !file.type.startsWith('image/')) {
            throw new Error('Fichier invalide');
        }

        // Créer une référence pour la photo
        const timestamp = Date.now();
        const photoRef = ref(storage, `profile-photos/${auth.currentUser.uid}/${timestamp}_${file.name}`);
        console.log('Référence photo créée:', photoRef);
        
        // Upload du fichier
        console.log('Début de l\'upload...');
        const snapshot = await uploadBytes(photoRef, file);
        console.log('Upload terminé:', snapshot);
        
        // Récupérer l'URL de téléchargement
        console.log('Récupération de l\'URL...');
        const downloadURL = await getDownloadURL(photoRef);
        console.log('URL obtenue:', downloadURL);
        
        // Mettre à jour le profil de l'utilisateur
        console.log('Mise à jour du profil utilisateur...');
        await updateProfile(auth.currentUser, {
            photoURL: downloadURL
        });
        console.log('Profil mis à jour avec succès');

        // Mettre à jour l'affichage
        const dropZone = document.querySelector('.drop-zone');
        const photoPreview = document.querySelector('.photo-preview');
        const previewImg = photoPreview.querySelector('img');
        const removePhotoBtn = document.querySelector('.remove-photo');
        
        if (!dropZone || !photoPreview || !previewImg || !removePhotoBtn) {
            throw new Error('Éléments d\'affichage manquants');
        }

        dropZone.style.display = 'none';
        previewImg.src = downloadURL;
        photoPreview.style.display = 'block';
        removePhotoBtn.style.display = 'block';
        
        alert('Photo de profil mise à jour avec succès !');
        
    } catch (error) {
        console.error('Erreur lors de l\'upload de la photo:', error);
        console.error('Code d\'erreur:', error.code);
        console.error('Message d\'erreur:', error.message);
        alert(`Erreur: ${error.message}`);
        throw error;
    }
}

// Fonction pour créer un nouveau post
async function createPost(event) {
    event.preventDefault();
    
    try {
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();
        const category = document.getElementById('post-category').value;
        const visibility = document.getElementById('post-visibility').value;
        const hashtagsInput = document.getElementById('post-hashtags').value.trim();
        
        const hashtags = hashtagsInput
            ? hashtagsInput.split(/[\s,]+/)
                .map(tag => tag.trim())
                .filter(tag => tag)
                .map(tag => tag.startsWith('#') ? tag : '#' + tag)
            : [];

        const newPost = {
            title,
            text: content,
            category,
            visibility,
            hashtags,
            userId: currentUser.uid,
            username: currentUser.displayName || 'Utilisateur anonyme',
            createdAt: serverTimestamp(),
            likes: [],
            comments: []
        };

        await addDoc(collection(db, 'projects'), newPost);
        document.getElementById('modal_create_post').classList.remove('active');
        document.getElementById('create-post-form').reset();
    } catch (error) {
        console.error('Erreur lors de la création du post:', error);
        alert('Une erreur est survenue lors de la création de la publication.');
    }
}

// Fonction pour gérer la suppression d'un post
async function handleDelete(postId) {
    try {
        console.log('Tentative de suppression du post:', postId);
        
        // Vérifier si l'utilisateur est connecté
        const user = auth.currentUser;
        if (!user) {
            console.error('Utilisateur non connecté');
            alert('Vous devez être connecté pour supprimer un post.');
            return;
        }
        console.log('Utilisateur connecté:', user.uid);

        if (!postId) {
            console.error('ID du post manquant');
            return;
        }

        if (confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
            const postRef = doc(db, 'projects', postId);
            const postDoc = await getDoc(postRef);
            
            if (!postDoc.exists()) {
                console.error('Post non trouvé');
                alert('Le post n\'existe pas.');
                return;
            }

            const postData = postDoc.data();
            console.log('Données du post:', postData);
            console.log('ID utilisateur du post:', postData.userId);
            console.log('ID utilisateur actuel:', user.uid);

            if (postData.userId !== user.uid) {
                console.error('Utilisateur non autorisé');
                alert('Vous n\'êtes pas autorisé à supprimer ce post.');
                return;
            }

            await deleteDoc(postRef);
            console.log('Post supprimé avec succès:', postId);
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du post:', error);
        console.error('Détails de l\'erreur:', error.message);
        alert('Une erreur est survenue lors de la suppression du post.');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initialisation de profile.js');
    
    // Attendre que l'authentification soit initialisée
    await new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            currentUser = user;
            unsubscribe();
            resolve();
        });
    });

    if (!currentUser) {
        console.error('Utilisateur non authentifié');
        window.location.href = '/';
        return;
    }

    console.log('Utilisateur authentifié:', currentUser.uid);
    
    // Récupérer les éléments du DOM
    const dropZone = document.querySelector('.drop-zone');
    const fileInput = document.getElementById('profile-photo');
    const uploadBtn = document.querySelector('.upload-btn');
    const removePhotoBtn = document.querySelector('.remove-photo');
    
    console.log('Éléments trouvés:', {
        dropZone: dropZone ? 'oui' : 'non',
        fileInput: fileInput ? 'oui' : 'non',
        uploadBtn: uploadBtn ? 'oui' : 'non',
        removePhotoBtn: removePhotoBtn ? 'oui' : 'non'
    });

    if (!fileInput || !uploadBtn || !dropZone) {
        console.error('Éléments manquants dans le DOM');
        return;
    }

    // Initialiser les événements
    uploadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Clic sur le bouton upload détecté');
        
        if (!storage) {
            console.error('Firebase Storage n\'est pas initialisé');
            alert('Une erreur est survenue. Le service de stockage n\'est pas disponible.');
            return;
        }
        
        fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
        console.log('Événement change détecté sur fileInput');
        const file = e.target.files[0];
        if (file) {
            console.log('Fichier sélectionné:', file);
            if (file.type.startsWith('image/')) {
                try {
                    await handlePhotoUpload(file);
                } catch (error) {
                    console.error('Erreur lors du téléchargement:', error);
                    alert('Une erreur est survenue lors du téléchargement de la photo.');
                }
            } else {
                console.log('Type de fichier invalide:', file.type);
                alert('Veuillez sélectionner une image valide.');
            }
        }
    });

    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Événement drag détecté:', eventName);
            });
        });

        dropZone.addEventListener('dragover', (e) => {
            console.log('Dragover détecté');
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            console.log('Dragleave détecté');
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Fichier déposé');
            dropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) {
                console.log('Type de fichier déposé:', file.type);
                if (file.type.startsWith('image/')) {
                    try {
                        await handlePhotoUpload(file);
                    } catch (error) {
                        console.error('Erreur lors du téléchargement:', error);
                        alert('Une erreur est survenue lors du téléchargement de la photo.');
                    }
                } else {
                    console.log('Type de fichier invalide:', file.type);
                    alert('Veuillez déposer une image valide.');
                }
            }
        });
    }

    // Gérer la suppression de la photo
    removePhotoBtn.addEventListener('click', async () => {
        try {
            await updateDoc(doc(db, 'users', currentUser.uid), {
                photoURL: null
            });
            document.querySelector('.drop-zone').style.display = 'block';
            document.querySelector('.photo-preview').style.display = 'none';
        } catch (error) {
            console.error('Erreur lors de la suppression de la photo:', error);
            alert('Une erreur est survenue lors de la suppression de la photo.');
        }
    });

    // Nettoyer l'ancien listener s'il existe
    if (unsubscribeListener) {
        unsubscribeListener();
    }

    // Gérer le clic sur le bouton profil
    document.getElementById('profile-btn').addEventListener('click', () => {
        document.getElementById('modal_profil').classList.add('active');
        
        // Remplir les champs du profil avec les informations de l'utilisateur
        if (currentUser) {
            const userDoc = doc(db, 'users', currentUser.uid);
            getDoc(userDoc).then((doc) => {
                if (doc.exists()) {
                    const userData = doc.data();
                    document.getElementById('firstname').value = userData.firstname || '';
                    document.getElementById('lastname').value = userData.lastname || '';
                    document.getElementById('email').value = userData.email || currentUser.email || '';
                    document.getElementById('bio').value = userData.bio || '';
                }
            }).catch(error => {
                console.error('Erreur lors du chargement des données utilisateur:', error);
            });
        }
    });

    // Gérer les onglets de la modal profil
    const tabBtns = document.querySelectorAll('.profile-tabs .tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons et contenus
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            // Ajouter la classe active au bouton cliqué
            btn.classList.add('active');

            // Afficher le contenu correspondant
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    });

    // Gérer la soumission du formulaire de sécurité
    document.getElementById('security-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const newEmail = document.getElementById('new-email').value.trim();
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;

            if (newEmail && newEmail !== currentUser.email) {
                // Mettre à jour l'email
                await updateEmail(auth.currentUser, newEmail);
                alert('Adresse email mise à jour avec succès !');
            }

            if (newPassword) {
                // Mettre à jour le mot de passe
                await updatePassword(auth.currentUser, newPassword);
                alert('Mot de passe mis à jour avec succès !');
            }

            document.getElementById('security-form').reset();
        } catch (error) {
            console.error('Erreur lors de la mise à jour des identifiants:', error);
            alert('Une erreur est survenue lors de la mise à jour des identifiants.');
        }
    });

    try {
        // Écouter les changements de posts en temps réel
        unsubscribeListener = onSnapshot(collection(db, 'projects'), (snapshot) => {
            const posts = [];
            snapshot.forEach((doc) => {
                const post = { id: doc.id, ...doc.data() };
                if (post.userId === currentUser.uid) {
                    posts.push(post);
                }
            });
            
            console.log('Affichage des posts sur la page profil');
            
            // Vérifier si l'utilisateur a des posts
            if (posts.length === 0) {
                document.getElementById('modal_no_posts').classList.add('active');
            }

            // Utiliser la nouvelle fonction displayPosts avec les handlers
            displayPosts(posts, postsContainer, currentUser, true, {
                onLike: handleLike,
                onComment: openCommentModal,
                onEdit: handleEdit,
                onDelete: handleDelete
            });
        });

        // Ajouter les écouteurs d'événements pour les modals
        document.getElementById('create-first-post').addEventListener('click', () => {
            document.getElementById('modal_no_posts').classList.remove('active');
            document.getElementById('modal_create_post').classList.add('active');
        });

        document.getElementById('create-post-form').addEventListener('submit', createPost);

        // Gérer la fermeture des modals
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                closeBtn.closest('.modal').classList.remove('active');
            });
        });

        // Gérer la soumission du formulaire de profil
        document.getElementById('profile-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const userData = {
                    firstname: document.getElementById('firstname').value.trim(),
                    lastname: document.getElementById('lastname').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    bio: document.getElementById('bio').value.trim()
                };

                await updateDoc(doc(db, 'users', currentUser.uid), userData);
                alert('Profil mis à jour avec succès !');
                document.getElementById('modal_profil').classList.remove('active');
            } catch (error) {
                console.error('Erreur lors de la mise à jour du profil:', error);
                alert('Une erreur est survenue lors de la mise à jour du profil.');
            }
        });

    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        if (postsContainer) {
        postsContainer.innerHTML = '<p class="error">Une erreur est survenue lors du chargement des posts.</p>';
    }
}
});

// Fonction pour gérer les likes
async function handleLike(postId) {
    // TODO: Implémenter la gestion des likes
    console.log('Like post:', postId);
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

// Fonction pour gérer l'édition d'un post
async function handleEdit(postId) {
    try {
        const postDoc = await getDoc(doc(db, 'projects', postId));
        if (!postDoc.exists()) {
            console.error('Post non trouvé');
            return;
        }

        const post = postDoc.data();
        
        // Remplir le formulaire d'édition
        document.getElementById('editTitle').value = post.title;
        document.getElementById('editContent').value = post.text;
        document.getElementById('editHashtags').value = post.hashtags ? post.hashtags.join(' ') : '';
        document.getElementById('editCategory').value = post.category;
        document.getElementById('editVisibility').value = post.visibility;

        // Ouvrir la modal d'édition
    const modal = document.getElementById('editPostModal');
    if (modal) {
        modal.classList.add('active');
        modal.dataset.postId = postId;
        }

        // Gérer la soumission du formulaire d'édition
        const form = document.getElementById('editPostForm');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                await updatePost(postId);
            };
        }
    } catch (error) {
        console.error('Erreur lors du chargement du post pour édition:', error);
        alert('Une erreur est survenue lors du chargement du post.');
    }
}

// Fonction pour mettre à jour un post
async function updatePost(postId) {
    try {
        const title = document.getElementById('editTitle').value.trim();
        const content = document.getElementById('editContent').value.trim();
        const hashtagsInput = document.getElementById('editHashtags').value.trim();
        const category = document.getElementById('editCategory').value;
        const visibility = document.getElementById('editVisibility').value;

        if (!title || !content || !category) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        const hashtags = hashtagsInput
            ? hashtagsInput.split(/[\s,]+/)
                .map(tag => tag.trim())
                .filter(tag => tag)
                .map(tag => tag.startsWith('#') ? tag : '#' + tag)
            : [];

        await updateDoc(doc(db, 'projects', postId), {
            title,
            text: content,
            hashtags,
            category,
            visibility
        });

        // Fermer la modal
        const modal = document.getElementById('editPostModal');
        if (modal) {
            modal.classList.remove('active');
        }

        alert('Publication mise à jour avec succès !');
    } catch (error) {
        console.error('Erreur lors de la mise à jour du post:', error);
        alert('Une erreur est survenue lors de la mise à jour du post.');
    }
} 