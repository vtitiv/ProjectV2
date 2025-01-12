import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { auth } from '../firebase-config.js';

// Vérifier l'état de l'authentification
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Vérifier si nous sommes sur la page de login
        if (window.location.pathname === '/pages/login.html' || window.location.pathname === '/') {
            window.location.href = '/accueil';
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginError = document.getElementById('login-error');
    const forgotPasswordBtn = document.getElementById('forgot-password-btn');
    const forgotPasswordSection = document.querySelector('.forgot-password-section');
    const sendRecoveryBtn = document.getElementById('send-recovery-btn');
    const googleLoginBtn = document.getElementById('google-login');
    const googleRegisterBtn = document.getElementById('google-register');

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });

    // Fonction pour gérer l'authentification Google
    async function handleGoogleAuth(event) {
        const button = event.currentTarget;
        button.disabled = true;
        button.style.opacity = '0.7';

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            // Les données utilisateur seront sauvegardées par onAuthStateChanged
            console.log('Connexion Google réussie');
            
        } catch (error) {
            console.error('Erreur de connexion Google:', error);
            let errorMessage = 'Erreur lors de la connexion avec Google';
            
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'La fenêtre de connexion a été fermée';
            } else if (error.code === 'auth/cancelled-popup-request') {
                errorMessage = 'Une autre fenêtre de connexion est déjà ouverte';
            } else if (error.code === 'auth/unauthorized-domain') {
                errorMessage = 'Ce domaine n\'est pas autorisé pour la connexion Google';
            }
            
            alert(errorMessage);
        } finally {
            button.disabled = false;
            button.style.opacity = '1';
        }
    }

    // Gestion de la connexion avec Google
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleAuth);
    }

    // Gestion de l'inscription avec Google
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', handleGoogleAuth);
    }

    // Gestion de la connexion
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = '/accueil';
            } catch (error) {
                console.error('Erreur de connexion:', error);
                let errorMessage = 'Erreur de connexion';
                
                if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Adresse email invalide';
                } else if (error.code === 'auth/user-disabled') {
                    errorMessage = 'Ce compte a été désactivé';
                } else if (error.code === 'auth/user-not-found') {
                    errorMessage = 'Aucun compte ne correspond à cette adresse email';
                } else if (error.code === 'auth/wrong-password') {
                    errorMessage = 'Mot de passe incorrect';
                }
                
                if (loginError) {
                    loginError.querySelector('p').textContent = errorMessage;
                    loginError.style.display = 'block';
                }
            }
        });
    }

    // Gestion de l'inscription
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            try {
                await createUserWithEmailAndPassword(auth, email, password);
                window.location.href = '/accueil';
            } catch (error) {
                console.error('Erreur d\'inscription:', error);
                let errorMessage = 'Erreur lors de l\'inscription';
                
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'Cette adresse email est déjà utilisée';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Adresse email invalide';
                } else if (error.code === 'auth/operation-not-allowed') {
                    errorMessage = 'L\'inscription par email/mot de passe n\'est pas activée';
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = 'Le mot de passe est trop faible';
                }
                
                alert(errorMessage);
            }
        });
    }

    // Gestion du mot de passe oublié
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', () => {
            if (forgotPasswordSection) {
                forgotPasswordSection.style.display = 'block';
            }
        });
    }

    // Gestion de l'envoi de l'email de récupération
    if (sendRecoveryBtn) {
        sendRecoveryBtn.addEventListener('click', async () => {
            const recoveryEmail = document.getElementById('recovery-email').value;
            try {
                await sendPasswordResetEmail(auth, recoveryEmail);
                alert('Un email de récupération a été envoyé à ' + recoveryEmail);
                if (forgotPasswordSection) {
                    forgotPasswordSection.style.display = 'none';
                }
            } catch (error) {
                console.error('Erreur d\'envoi de l\'email de récupération:', error);
                let errorMessage = 'Erreur lors de l\'envoi de l\'email de récupération';
                
                if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Adresse email invalide';
                } else if (error.code === 'auth/user-not-found') {
                    errorMessage = 'Aucun compte ne correspond à cette adresse email';
                }
                
                alert(errorMessage);
            }
        });
    }
}); 