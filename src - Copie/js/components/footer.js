import { auth } from '../firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Initialisation du footer...");
    
    // Initialiser EmailJS
    emailjs.init("OU4x8LQB2CGSdkcjO");
    console.log("EmailJS initialisé");

    // Gérer l'affichage du formulaire de contact
    const contactBtn = document.getElementById('footer-contact');
    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            const user = auth.currentUser;
            if (user) {
                const userInfo = document.getElementById('contact-user-info');
                if (userInfo) {
                    userInfo.textContent = `${user.displayName || user.email}`;
                }
                
                const fromName = document.getElementById('contact-from-name');
                const fromEmail = document.getElementById('contact-from-email');
                const userId = document.getElementById('contact-user-id');
                
                if (fromName) fromName.value = user.displayName || user.email;
                if (fromEmail) fromEmail.value = user.email;
                if (userId) userId.value = user.uid;
                
                const modal = document.getElementById('contact-modal');
                if (modal) modal.classList.add('active');
            } else {
                alert('Vous devez être connecté pour nous contacter.');
            }
        });
    }

    // Gérer l'envoi du formulaire de contact
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Soumission du formulaire de contact");
            
            try {
                const user = auth.currentUser;
                if (!user) {
                    throw new Error('Vous devez être connecté pour nous contacter.');
                }

                const messageInput = document.getElementById('contact-message');
                if (!messageInput || !messageInput.value.trim()) {
                    throw new Error('Veuillez entrer un message.');
                }

                const templateParams = {
                    to_name: "Admin",
                    from_name: user.displayName || user.email,
                    from_email: user.email,
                    user_id: user.uid,
                    message: messageInput.value.trim()
                };
                
                console.log("Envoi du message via EmailJS avec les paramètres:", templateParams);

                const response = await emailjs.send(
                    'service_yvxm',
                    'uAPU9nwtO3-BoD8mYHvad',
                    templateParams,
                    'OU4x8LQB2CGSdkcjO'
                );
                
                console.log("Réponse EmailJS:", response);

                if (response.status === 200 || response.text === 'OK') {
                    alert('Votre message a été envoyé avec succès !');
                    const modal = document.getElementById('contact-modal');
                    if (modal) modal.classList.remove('active');
                    contactForm.reset();
                } else {
                    throw new Error('Erreur lors de l\'envoi du message');
                }
            } catch (error) {
                console.error('Erreur lors de l\'envoi du message:', error);
                alert(error.message || 'Une erreur est survenue lors de l\'envoi du message.');
            }
        });
    }

    // Gérer l'affichage des CGU
    const cguBtn = document.getElementById('footer-cgu');
    if (cguBtn) {
        cguBtn.addEventListener('click', () => {
            const modal = document.getElementById('modal_cgu');
            if (modal) modal.classList.add('active');
        });
    }

    // Fermer les modals
    document.querySelectorAll('.modal .close, .modal .cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                const form = modal.querySelector('form');
                if (form) form.reset();
            }
        });
    });

    // Fermer la modal CGU
    const closeCguBtn = document.querySelector('.close-cgu');
    if (closeCguBtn) {
        closeCguBtn.addEventListener('click', () => {
            const modal = document.getElementById('modal_cgu');
            if (modal) modal.classList.remove('active');
        });
    }
}); 