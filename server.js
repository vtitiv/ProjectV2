import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sgMail from '@sendgrid/mail';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware pour servir les fichiers statiques et parser le JSON
app.use(express.static('src'));
app.use(express.json());
app.use(cors());

// Configuration de SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Route pour l'envoi d'email de contact
app.post('/api/send-contact', async (req, res) => {
    try {
        const { message, uid, displayName, email } = req.body;

        if (!message || !uid || !displayName || !email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Données manquantes pour l\'envoi de l\'email' 
            });
        }

        const msg = {
            to: process.env.ADMIN_EMAIL,
            from: process.env.VERIFIED_SENDER,
            subject: 'Nouveau message de contact',
            html: `
                <h3>Message de contact</h3>
                <p><strong>De :</strong> ${displayName} (${email})</p>
                <p><strong>ID utilisateur :</strong> ${uid}</p>
                <h4>Message :</h4>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `
        };

        await sgMail.send(msg);
        console.log('Email envoyé avec succès');
        res.json({ success: true, message: 'Email envoyé avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'envoi de l\'email',
            error: error.message 
        });
    }
});

// Routes pour les pages principales
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/pages/login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/pages/login.html'));
});

app.get('/accueil', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/pages/accueil.html'));
});

app.get('/profil', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/pages/profil.html'));
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'src/pages/404.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
}); 