import emailjs from '@emailjs/browser';

// =====================================
// CONFIGURAÇÃO DO EMAILJS
// =====================================
// IMPORTANTE: Você precisa criar uma conta gratuita em https://emailjs.com
// e substituir estas variáveis pelas suas credenciais:
//
// 1. Crie um serviço de email (Email Service) - conectando seu Gmail, Outlook, etc.
// 2. Crie um template (Email Template) com as variáveis abaixo
// 3. Copie o Public Key da seção "Account" > "General"
//
// Template sugerido para EmailJS:
// Subject: Convite para acessar {{clinic_name}} - NeuroDose Assist
// Body:
//   Olá!
//
//   {{sender_name}} convidou você para participar da clínica "{{clinic_name}}" 
//   como {{role}} no sistema NeuroDose Assist.
//
//   Para aceitar o convite, acesse o link abaixo:
//   {{invite_link}}
//
//   Atenciosamente,
//   Equipe NeuroDose Assist
// =====================================

const EMAILJS_SERVICE_ID = 'service_dzmkuxb';
const EMAILJS_TEMPLATE_ID = 'template_qxu47ad';
const EMAILJS_PUBLIC_KEY = 'wVfNjG-B6K5PsmzPp';

// Inicializar EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface InviteEmailParams {
    toEmail: string;
    clinicName: string;
    senderName: string;
    role: string;
    inviteLink: string;
}

/**
 * Envia um email de convite para a clínica
 */
export async function sendInviteEmail(params: InviteEmailParams): Promise<boolean> {
    const { toEmail, clinicName, senderName, role, inviteLink } = params;

    console.log('[Email] Tentando enviar convite para:', toEmail);

    try {
        const templateParams = {
            to_email: toEmail,
            clinic_name: clinicName,
            sender_name: senderName,
            role: getRoleLabel(role),
            invite_link: inviteLink,
        };

        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
        );

        console.log('[Email] Convite enviado com sucesso:', response.status);
        return true;
    } catch (error) {
        console.error('[Email] Erro ao enviar convite:', error);
        return false;
    }
}

/**
 * Converte a role para label em português
 */
function getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
        owner: 'Proprietário',
        admin: 'Administrador',
        member: 'Membro',
    };
    return labels[role] || role;
}

/**
 * Gera o link de convite para o email
 */
export function generateInviteLink(inviteId: string, clinicId: string): string {
    // Usa a URL atual para gerar o link
    const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : 'https://neurodose.vercel.app';

    return `${baseUrl}/clinic?invite=${inviteId}&clinic=${clinicId}`;
}
