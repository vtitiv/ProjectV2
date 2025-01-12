document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');

    function switchTab(targetTab) {
        // Masquer tous les contenus d'onglets
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });

        // Retirer la classe active de tous les boutons
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
        });

        // Afficher l'onglet cible
        document.getElementById(targetTab).style.display = 'block';
        // Activer le bouton correspondant
        document.querySelector(`[data-tab="${targetTab}"]`).classList.add('active');
    }

    // Ajouter les écouteurs d'événements aux boutons
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Afficher l'onglet de connexion par défaut
    switchTab('login-tab');
}); 