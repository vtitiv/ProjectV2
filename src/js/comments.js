document.addEventListener('DOMContentLoaded', () => {
    const commentsList = document.querySelector('.comments-list');

    // Fonction pour créer un commentaire
    function createComment(comment, isReply = false) {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        if (isReply) {
            commentElement.classList.add('comment-reply');
        }

        commentElement.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${comment.author}</span>
                <div class="comment-actions">
                    <button class="like-comment">
                        <i class="far fa-heart"></i>
                        <span class="like-count">${comment.likes}</span>
                    </button>
                    ${!isReply ? '<button class="reply-comment">Répondre</button>' : ''}
                    ${comment.isAuthor ? '<button class="delete-comment">Supprimer</button>' : ''}
                </div>
            </div>
            <div class="comment-content">${comment.content}</div>
            ${!isReply ? `
                <div class="comment-footer">
                    <button class="toggle-replies" style="display: none;">
                        <i class="fas fa-chevron-down"></i>
                        <span>Voir les réponses</span>
                        <span class="replies-count">(0)</span>
                    </button>
                </div>
                <div class="sub-comments" style="display: none;"></div>
            ` : ''}
        `;

        // Gestion des likes de commentaires
        const likeBtn = commentElement.querySelector('.like-comment');
        likeBtn.addEventListener('click', () => {
            const icon = likeBtn.querySelector('i');
            const likeCount = likeBtn.querySelector('.like-count');
            if (icon.classList.contains('far')) {
                icon.classList.replace('far', 'fas');
                likeCount.textContent = parseInt(likeCount.textContent) + 1;
            } else {
                icon.classList.replace('fas', 'far');
                likeCount.textContent = parseInt(likeCount.textContent) - 1;
            }
        });

        // Gestion des réponses
        if (!isReply) {
            const replyBtn = commentElement.querySelector('.reply-comment');
            const subComments = commentElement.querySelector('.sub-comments');
            const toggleRepliesBtn = commentElement.querySelector('.toggle-replies');
            let repliesCount = 0;

            // Fonction pour mettre à jour le compteur et l'affichage du bouton
            function updateRepliesCount() {
                repliesCount = subComments.querySelectorAll('.comment-reply').length;
                const repliesCountSpan = toggleRepliesBtn.querySelector('.replies-count');
                repliesCountSpan.textContent = `(${repliesCount})`;
                toggleRepliesBtn.style.display = repliesCount > 0 ? 'flex' : 'none';
                
                // Mettre à jour le texte du bouton selon l'état
                const textSpan = toggleRepliesBtn.querySelector('span:not(.replies-count)');
                const icon = toggleRepliesBtn.querySelector('i');
                if (subComments.style.display === 'none') {
                    textSpan.textContent = 'Voir les réponses';
                    icon.className = 'fas fa-chevron-down';
                } else {
                    textSpan.textContent = 'Masquer les réponses';
                    icon.className = 'fas fa-chevron-up';
                }
            }

            // Gestion du bouton toggle
            toggleRepliesBtn.addEventListener('click', () => {
                const isHidden = subComments.style.display === 'none';
                subComments.style.display = isHidden ? 'block' : 'none';
                updateRepliesCount();
            });

            if (replyBtn) {
                replyBtn.addEventListener('click', () => {
                    // Vérifier si un formulaire de réponse existe déjà
                    const existingForm = commentElement.querySelector('.reply-form');
                    if (existingForm) {
                        existingForm.remove();
                        return;
                    }

                    const replyForm = document.createElement('div');
                    replyForm.classList.add('comment-form', 'reply-form');
                    replyForm.innerHTML = `
                        <textarea placeholder="Écrivez votre réponse..."></textarea>
                        <div class="form-actions">
                            <button class="send-reply">Envoyer</button>
                            <button class="cancel-reply">Annuler</button>
                        </div>
                    `;

                    subComments.insertBefore(replyForm, subComments.firstChild);
                    subComments.style.display = 'block';
                    updateRepliesCount();

                    // Focus sur le textarea
                    replyForm.querySelector('textarea').focus();

                    // Gestion de l'envoi de la réponse
                    const sendReplyBtn = replyForm.querySelector('.send-reply');
                    sendReplyBtn.addEventListener('click', () => {
                        const replyContent = replyForm.querySelector('textarea').value;
                        if (replyContent.trim()) {
                            const reply = {
                                author: 'Utilisateur actuel',
                                content: replyContent,
                                likes: 0,
                                isAuthor: true
                            };
                            const replyElement = createComment(reply, true);
                            subComments.insertBefore(replyElement, replyForm);
                            replyForm.remove();
                            updateRepliesCount();
                        }
                    });

                    // Gestion de l'annulation de la réponse
                    const cancelReplyBtn = replyForm.querySelector('.cancel-reply');
                    cancelReplyBtn.addEventListener('click', () => {
                        replyForm.remove();
                        if (subComments.children.length === 0) {
                            subComments.style.display = 'none';
                        }
                        updateRepliesCount();
                    });
                });
            }
        }

        // Gestion de la suppression
        const deleteBtn = commentElement.querySelector('.delete-comment');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('Voulez-vous vraiment supprimer ce commentaire ?')) {
                    const parentComment = commentElement.closest('.comment:not(.comment-reply)');
                    commentElement.remove();
                    
                    // Si c'est une réponse, mettre à jour le compteur du commentaire parent
                    if (isReply && parentComment) {
                        const updateEvent = new Event('updateRepliesCount');
                        parentComment.dispatchEvent(updateEvent);
                    }
                }
            });
        }

        return commentElement;
    }

    // Fonction pour ajouter un nouveau commentaire
    function addNewComment(content) {
        const comment = {
            author: 'Utilisateur actuel',
            content: content,
            likes: 0,
            isAuthor: true
        };
        const commentElement = createComment(comment);
        commentsList.insertBefore(commentElement, commentsList.firstChild);
    }

    // Gestion du formulaire de commentaire principal
    const commentForm = document.querySelector('.comment-form');
    const sendCommentBtn = commentForm.querySelector('.send-comment');
    const commentInput = commentForm.querySelector('textarea');

    sendCommentBtn.addEventListener('click', () => {
        const content = commentInput.value;
        if (content.trim()) {
            addNewComment(content);
            commentInput.value = '';
        }
    });

    // Exemple de commentaires
    const sampleComments = [
        {
            author: 'John Doe',
            content: 'Super projet !',
            likes: 5,
            isAuthor: false
        }
    ];

    // Afficher les commentaires d'exemple
    sampleComments.forEach(comment => {
        commentsList.appendChild(createComment(comment));
    });
}); 