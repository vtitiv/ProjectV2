/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Configuration de nodemailer avec Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendContactEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "Vous devez être connecté pour envoyer un message.",
    );
  }

  const {message} = data;
  const user = context.auth;

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Nouveau message de contact",
      text: `
Message de : ${user.token.name} (${user.token.email})
ID utilisateur : ${user.uid}

Message :
${message}
            `,
      html: `
<h3>Message de contact</h3>
<p><strong>De :</strong> ${user.token.name} (${user.token.email})</p>
<p><strong>ID utilisateur :</strong> ${user.uid}</p>
<h4>Message :</h4>
<p>${message.replace(/\n/g, "<br>")}</p>
            `,
    };

    await transporter.sendMail(mailOptions);
    return {success: true, message: "Email envoyé avec succès"};
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Erreur lors de l'envoi de l'email",
        error,
    );
  }
});
