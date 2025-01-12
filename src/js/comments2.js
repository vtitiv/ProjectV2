import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from '../js/firebase-config.js';
import { auth } from '../js/firebase-config.js';

// Fonction pour charger les commentaires d'un post
export async function loadCommentsForPost(postId) {
    try {
        const postRef = doc(db, 'projects', postId);
        const postDoc = await getDoc(postRef);
        
        if (postDoc.exists()) {
            const post = postDoc.data();
            const comments = post.comments || [];
            const commentsList = document.querySelector('.comments-list');
            const currentUser = auth.currentUser;
            
            if (commentsList) {
                commentsList.innerHTML = '';
                comments.forEach(comment => {
                    const commentElement = document.createElement('div');
                    commentElement.classList.add('comment');
                    const isAuthor = currentUser && comment.authorId === currentUser.uid;
                    
                    commentElement.innerHTML = `
                        <div class="comment-header">
                            <span class="comment-author">${comment.author}</span>
                            <div class="comment-actions">
                                <button class="like-comment">
                                    <i class="${comment.likes && comment.likes.includes(currentUser?.uid) ? 'fas' : 'far'} fa-heart"></i>
                                    <span class="like-count">${comment.likes ? comment.likes.length : 0}</span>
                                </button>
                                <button class="reply-comment">Répondre</button>
                                ${isAuthor ? '<button class="delete-comment">Supprimer</button>' : ''}
                            </div>
                        </div>
                        <div class="comment-content">${comment.content}</div>
                        <div class="sub-comments" style="display: none;">
                            ${(comment.replies || []).map(reply => `
                                <div class="comment reply" data-reply-id="${reply.id}">
                                    <div class="comment-header">
                                        <span class="comment-author">${reply.author}</span>
                                        <div class="comment-actions">
                                            <button class="like-comment">
                                                <i class="${reply.likes && reply.likes.includes(currentUser?.uid) ? 'fas' : 'far'} fa-heart"></i>
                                                <span class="like-count">${reply.likes ? reply.likes.length : 0}</span>
                                            </button>
                                            ${reply.authorId === currentUser?.uid ? '<button class="delete-reply">Supprimer</button>' : ''}
                                        </div>
                                    </div>
                                    <div class="comment-content">${reply.content}</div>
                                </div>
                            `).join('')}
                        </div>
                        ${comment.replies && comment.replies.length > 0 ? `
                            <button class="toggle-replies">
                                Voir les réponses (${comment.replies.length})
                            </button>
                        ` : ''}
                    `;

                    // Gestion du like
                    const likeBtn = commentElement.querySelector('.like-comment');
                    likeBtn.addEventListener('click', () => handleLike(postId, comment.id));

                    // Gestion de la réponse
                    const replyBtn = commentElement.querySelector('.reply-comment');
                    replyBtn.addEventListener('click', () => {
                        const subComments = commentElement.querySelector('.sub-comments');
                        const existingForm = subComments.querySelector('.reply-form');
                        
                        if (existingForm) {
                            existingForm.remove();
                            return;
                        }

                        const replyForm = document.createElement('div');
                        replyForm.classList.add('reply-form');
                        replyForm.innerHTML = `
                            <textarea placeholder="Écrivez votre réponse..."></textarea>
                            <div class="form-actions">
                                <button class="send-reply">Envoyer</button>
                                <button class="cancel-reply">Annuler</button>
                            </div>
                        `;

                        subComments.style.display = 'block';
                        subComments.insertBefore(replyForm, subComments.firstChild);

                        const sendReplyBtn = replyForm.querySelector('.send-reply');
                        sendReplyBtn.addEventListener('click', () => {
                            const replyContent = replyForm.querySelector('textarea').value;
                            if (replyContent.trim()) {
                                addReply(postId, comment.id, replyContent);
                                replyForm.remove();
                            }
                        });

                        const cancelReplyBtn = replyForm.querySelector('.cancel-reply');
                        cancelReplyBtn.addEventListener('click', () => replyForm.remove());
                    });

                    // Gestion de la suppression du commentaire principal
                    const deleteBtn = commentElement.querySelector('.delete-comment');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', () => {
                            if (confirm('Voulez-vous vraiment supprimer ce commentaire ?')) {
                                deleteComment(postId, comment.id);
                            }
                        });
                    }

                    // Gestion de la suppression des réponses
                    const subComments = commentElement.querySelector('.sub-comments');
                    const deleteReplyBtns = subComments.querySelectorAll('.delete-reply');
                    deleteReplyBtns.forEach(btn => {
                        btn.addEventListener('click', () => {
                            const replyElement = btn.closest('.reply');
                            const replyId = replyElement.dataset.replyId;
                            if (confirm('Voulez-vous vraiment supprimer cette réponse ?')) {
                                deleteComment(postId, comment.id, replyId);
                            }
                        });
                    });

                    // Gestion du toggle des réponses
                    const toggleRepliesBtn = commentElement.querySelector('.toggle-replies');
                    if (toggleRepliesBtn) {
                        toggleRepliesBtn.addEventListener('click', () => {
                            const subComments = commentElement.querySelector('.sub-comments');
                            const isHidden = subComments.style.display === 'none';
                            subComments.style.display = isHidden ? 'block' : 'none';
                            toggleRepliesBtn.textContent = isHidden ? 
                                `Masquer les réponses (${comment.replies.length})` : 
                                `Voir les réponses (${comment.replies.length})`;
                        });
                    }

                    // Ajout des event listeners pour les likes des réponses
                    const likeReplyBtns = subComments.querySelectorAll('.like-comment');
                    likeReplyBtns.forEach(btn => {
                        const replyElement = btn.closest('.reply');
                        const replyId = replyElement.dataset.replyId;
                        btn.addEventListener('click', () => handleLike(postId, comment.id, replyId));
                    });

                    commentsList.appendChild(commentElement);
                });
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des commentaires:', error);
    }
}

// Fonction pour ajouter un nouveau commentaire
export async function addComment(postId, commentText, author) {
    try {
        const postRef = doc(db, 'projects', postId);
        const currentUser = auth.currentUser;
        
        const newComment = {
            id: Date.now().toString(),
            author: author,
            authorId: currentUser.uid,
            content: commentText,
            timestamp: new Date().toISOString(),
            likes: [],
            replies: []
        };
        
        await updateDoc(postRef, {
            comments: arrayUnion(newComment)
        });
        
        await loadCommentsForPost(postId);
    } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
    }
}

// Fonction pour ajouter une réponse à un commentaire
async function addReply(postId, commentId, replyContent) {
    try {
        const postRef = doc(db, 'projects', postId);
        const postDoc = await getDoc(postRef);
        const currentUser = auth.currentUser;
        
        if (postDoc.exists()) {
            const post = postDoc.data();
            const comments = post.comments || [];
            const commentIndex = comments.findIndex(c => c.id === commentId);
            
            if (commentIndex !== -1) {
                const newReply = {
                    id: Date.now().toString(),
                    author: currentUser.displayName || 'Utilisateur anonyme',
                    authorId: currentUser.uid,
                    content: replyContent,
                    timestamp: new Date().toISOString(),
                    likes: []
                };
                
                const updatedComment = {
                    ...comments[commentIndex],
                    replies: [...(comments[commentIndex].replies || []), newReply]
                };
                
                const updatedComments = [...comments];
                updatedComments[commentIndex] = updatedComment;
                
                await updateDoc(postRef, { comments: updatedComments });
                await loadCommentsForPost(postId);
            }
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la réponse:', error);
    }
}

// Fonction pour gérer les likes
async function handleLike(postId, commentId, replyId = null) {
    try {
        const postRef = doc(db, 'projects', postId);
        const postDoc = await getDoc(postRef);
        const currentUser = auth.currentUser;
        
        if (postDoc.exists() && currentUser) {
            const post = postDoc.data();
            const comments = post.comments || [];
            const commentIndex = comments.findIndex(c => c.id === commentId);
            
            if (commentIndex !== -1) {
                const comment = comments[commentIndex];
                
                if (replyId) {
                    // Gestion du like pour une réponse
                    const replyIndex = comment.replies.findIndex(r => r.id === replyId);
                    if (replyIndex !== -1) {
                        const reply = comment.replies[replyIndex];
                        const likes = reply.likes || [];
                        const userIndex = likes.indexOf(currentUser.uid);
                        
                        if (userIndex === -1) {
                            likes.push(currentUser.uid);
                        } else {
                            likes.splice(userIndex, 1);
                        }
                        
                        const updatedReply = { ...reply, likes };
                        const updatedReplies = [...comment.replies];
                        updatedReplies[replyIndex] = updatedReply;
                        
                        const updatedComment = { ...comment, replies: updatedReplies };
                        const updatedComments = [...comments];
                        updatedComments[commentIndex] = updatedComment;
                        
                        await updateDoc(postRef, { comments: updatedComments });
                    }
                } else {
                    // Gestion du like pour un commentaire principal
                    const likes = comment.likes || [];
                    const userIndex = likes.indexOf(currentUser.uid);
                    
                    if (userIndex === -1) {
                        likes.push(currentUser.uid);
                    } else {
                        likes.splice(userIndex, 1);
                    }
                    
                    const updatedComment = { ...comment, likes };
                    const updatedComments = [...comments];
                    updatedComments[commentIndex] = updatedComment;
                    
                    await updateDoc(postRef, { comments: updatedComments });
                }
                
                await loadCommentsForPost(postId);
            }
        }
    } catch (error) {
        console.error('Erreur lors de la gestion du like:', error);
    }
}

// Fonction pour supprimer un commentaire ou une réponse
async function deleteComment(postId, commentId, replyId = null) {
    try {
        const postRef = doc(db, 'projects', postId);
        const postDoc = await getDoc(postRef);
        
        if (postDoc.exists()) {
            const post = postDoc.data();
            const comments = post.comments || [];
            
            if (replyId) {
                // Suppression d'une réponse
                const commentIndex = comments.findIndex(c => c.id === commentId);
                if (commentIndex !== -1) {
                    const comment = comments[commentIndex];
                    const updatedReplies = (comment.replies || []).filter(r => r.id !== replyId);
                    
                    const updatedComment = {
                        ...comment,
                        replies: updatedReplies
                    };
                    
                    const updatedComments = [...comments];
                    updatedComments[commentIndex] = updatedComment;
                    
                    await updateDoc(postRef, { comments: updatedComments });
                }
            } else {
                // Suppression d'un commentaire principal
                const updatedComments = comments.filter(c => c.id !== commentId);
                await updateDoc(postRef, { comments: updatedComments });
            }
            
            await loadCommentsForPost(postId);
        }
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
    }
} 