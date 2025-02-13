const nodemailer = require('nodemailer');

// En production, utilisez un service comme SendGrid, Mailgun, ou Amazon SES
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.NODE_ENV === 'production',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

const emailService = {
    async sendPasswordResetEmail(email, resetToken, firstName) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: `"CESIZen" <${process.env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: 'Réinitialisation de votre mot de passe CESIZen',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Réinitialisation de votre mot de passe</h2>
                    <p>Bonjour ${firstName || ''},</p>
                    <p>Vous avez demandé la réinitialisation de votre mot de passe CESIZen.</p>
                    <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
                    <p>
                        <a href="${resetUrl}" 
                            style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Réinitialiser mon mot de passe
                        </a>
                    </p>
                    <p>Ce lien expirera dans 1 heure.</p>
                    <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
                    <p>Cordialement,<br>L'équipe CESIZen</p>
                </div>
            `
        };

        try {
            // Log détaillé des paramètres de configuration SMTP
            console.log('Configuration SMTP:', {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: process.env.NODE_ENV === 'production',
                user: process.env.SMTP_USER,
                // Ne jamais log le mot de passe complet
                userPartial: process.env.SMTP_USER ? process.env.SMTP_USER.slice(0, 3) + '...' : 'N/A'
            });
    
            console.log('Options email:', {
                from: mailOptions.from,
                to: mailOptions.to,
                subject: mailOptions.subject
            });
    
            const info = await transporter.sendMail(mailOptions);
            
            // Log du résultat de l'envoi
            console.log('Email envoyé avec succès:', {
                messageId: info.messageId,
                response: info.response
            });
    
            return info;
        } catch (error) {
            // Log détaillé de l'erreur
            console.error('Détails complets de l\'erreur d\'email:', {
                message: error.message,
                name: error.name,
                code: error.code,
                response: error.response,
                stack: error.stack
            });
    
            throw new Error(`Erreur d'envoi d'email: ${error.message}`);
        }    
    }
};

module.exports = emailService;