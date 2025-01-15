// Vérifier si l'utilisateur a déjà fait son choix concernant les cookies
document.addEventListener('DOMContentLoaded', () => {
    const cookieChoice = localStorage.getItem('cookieChoice');
    if (!cookieChoice) {
        document.getElementById('modal_cookies').classList.add('active');
    } else {
        // Restaurer les choix précédents
        const cookieSettings = JSON.parse(localStorage.getItem('cookieSettings') || '{}');
        document.getElementById('optional-cookies').checked = cookieSettings.optional || false;
        document.getElementById('accept-cgu').checked = cookieSettings.cguAccepted || false;
    }

    // Gérer l'affichage des CGU complètes
    document.getElementById('view-full-cgu').addEventListener('click', () => {
        document.getElementById('modal_cgu').classList.add('active');
    });

    // Gérer la fermeture des CGU
    document.querySelectorAll('.close-cgu, #modal_cgu .close').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('modal_cgu').classList.remove('active');
        });
    });

    // Activer/désactiver le bouton de sauvegarde en fonction de l'acceptation des CGU
    document.getElementById('accept-cgu').addEventListener('change', (e) => {
        document.getElementById('save-cookies').disabled = !e.target.checked;
    });

    // Gérer le choix des cookies et CGU
    document.getElementById('save-cookies').addEventListener('click', () => {
        const optionalCookies = document.getElementById('optional-cookies').checked;
        const cguAccepted = document.getElementById('accept-cgu').checked;
        
        if (!cguAccepted) {
            alert('Vous devez accepter les CGU pour continuer.');
            return;
        }
        
        // Sauvegarder les choix
        localStorage.setItem('cookieChoice', 'saved');
        localStorage.setItem('cookieSettings', JSON.stringify({
            essential: true, // Toujours true car obligatoire
            optional: optionalCookies,
            cguAccepted: true
        }));

        document.getElementById('modal_cookies').classList.remove('active');
    });
}); 