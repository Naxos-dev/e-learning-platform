import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// Notification "best effort" : une inscription ne doit jamais échouer à cause de l'email.
// Désactivée silencieusement si RESEND_API_KEY / NOTIFICATION_EMAIL ne sont pas configurées.
export async function notifyNewRegistration(userEmail: string, role: string): Promise<void> {
  if (!resend || !env.NOTIFICATION_EMAIL) return;

  try {
    const { error } = await resend.emails.send({
      from: 'LearnFlow <onboarding@resend.dev>',
      to: env.NOTIFICATION_EMAIL,
      subject: `Nouvelle inscription LearnFlow : ${userEmail}`,
      text: [
        'Un nouveau compte vient d\'être créé sur LearnFlow.',
        '',
        `Email : ${userEmail}`,
        `Rôle : ${role}`,
        `Date : ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`,
      ].join('\n'),
    });
    if (error) {
      console.error('Échec de la notification email (Resend) :', error.message);
    }
  } catch (err) {
    console.error('Échec de la notification email :', err);
  }
}
