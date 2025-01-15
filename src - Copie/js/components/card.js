// Fonction pour créer une carte de post
export function createCard(post, isProfilePage, handlers) {
    console.log('Création d\'une carte pour le post:', post);
    console.log('isProfilePage:', isProfilePage);
    console.log('Handlers:', handlers);

    const card = document.createElement('div');
    card.className = 'card';
    
    // Créer l'overlay
    const overlay = document.createElement('div');
    overlay.className = 'card-overlay';
    document.body.appendChild(overlay);

    // Bouton d'agrandissement
    const expandBtn = document.createElement('button');
    expandBtn.className = 'expand-btn';
    expandBtn.innerHTML = '<i class="fas fa-expand"></i>';
    expandBtn.title = 'Agrandir/Réduire';
    
    // Gestion de l'agrandissement
    const handleExpand = () => {
        const isExpanded = card.classList.toggle('expanded');
        overlay.classList.toggle('active');
        expandBtn.innerHTML = isExpanded ? 
            '<i class="fas fa-compress"></i>' : 
            '<i class="fas fa-expand"></i>';
    };

    expandBtn.addEventListener('click', handleExpand);
    overlay.addEventListener('click', () => {
        if (card.classList.contains('expanded')) {
            handleExpand();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && card.classList.contains('expanded')) {
            handleExpand();
        }
    });

    const cardContent = `
        <div class="card-header">
            <h2 class="card-title">${post.title}</h2>
            <span class="card-category">${post.category}</span>
        </div>
        <div class="card-content">
            <p class="card-text">${post.text}</p>
            ${post.hashtags && post.hashtags.length > 0 ? `
                <div class="card-hashtags">
                    ${post.hashtags.map(tag => `<span class="card-hashtag">${tag}</span>`).join('')}
                </div>
            ` : ''}
        </div>
        <div class="card-footer">
            <div class="card-metadata">
                <span class="card-author">${post.username}</span>
                <span class="card-date">${new Date(post.createdAt.seconds * 1000).toLocaleDateString()}</span>
            </div>
            <div class="card-actions">
                <button class="card-action-btn ${post.likes?.includes(handlers?.currentUserId) ? 'liked' : ''}" data-action="like">
                    <i class="fas fa-heart"></i>
                    <span>${post.likes?.length || 0}</span>
                </button>
                <button class="card-action-btn" data-action="comment">
                    <i class="fas fa-comment"></i>
                    <span>${post.comments?.length || 0}</span>
                </button>
                ${isProfilePage === true ? `
                    <button class="card-action-btn" data-action="edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="card-action-btn" data-action="delete">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `;

    card.innerHTML = cardContent;
    card.insertBefore(expandBtn, card.firstChild);

    // Ajouter les gestionnaires d'événements
    if (handlers) {
        const likeBtn = card.querySelector('[data-action="like"]');
        if (likeBtn && handlers.onLike) {
            likeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handlers.onLike(post.id);
            });
        }

        const commentBtn = card.querySelector('[data-action="comment"]');
        if (commentBtn && handlers.onComment) {
            commentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handlers.onComment(post.id);
            });
        }

        if (isProfilePage === true) {
            const editBtn = card.querySelector('[data-action="edit"]');
            if (editBtn && handlers.onEdit) {
                editBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlers.onEdit(post.id);
                });
            }

            const deleteBtn = card.querySelector('[data-action="delete"]');
            if (deleteBtn && handlers.onDelete) {
                deleteBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlers.onDelete(post.id);
                });
            }
        }
    }

    return card;
} 