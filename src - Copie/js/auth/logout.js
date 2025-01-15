import { signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { auth } from '../firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.querySelector('.logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                localStorage.removeItem('user');
                window.location.href = '/';
            } catch (error) {
                console.error('Erreur lors de la déconnexion:', error);
                alert('Une erreur est survenue lors de la déconnexion. Veuillez réessayer.');
            }
        });
    }
}); 