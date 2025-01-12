document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    const body = document.body;

    // Créer l'overlay
    const overlay = document.createElement('div');
    overlay.classList.add('menu-overlay');
    body.appendChild(overlay);

    // Fonction pour ouvrir/fermer le menu
    function toggleMenu() {
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
        body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    }

    // Gestionnaires d'événements
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    overlay.addEventListener('click', () => {
        toggleMenu();
    });

    // Fermer le menu avec la touche Echap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            toggleMenu();
        }
    });

    // Empêcher la fermeture du menu en cliquant dessus
    menu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Gérer le bouton de publication
    const publishBtn = document.getElementById('publish-btn');
    const publishModal = document.getElementById('modal_publish');

    if (publishBtn && publishModal) {
        publishBtn.addEventListener('click', () => {
            publishModal.classList.add('active');
            toggleMenu(); // Fermer le menu quand on ouvre la modal
        });
    }
}); 