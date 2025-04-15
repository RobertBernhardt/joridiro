import nodemailer from 'nodemailer'
import { MailtrapClient } from 'mailtrap';


export const sendMail = (to: string, uuid: string, template_variables: any) => {
    const TOKEN = process.env.MAIL_PASSWORD;
    const ENDPOINT = "https://send.api.mailtrap.io/";
    const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });
    const sender = {
        email: process.env.ADMIN_EMAIL,
    };
    const recipients = [
        {
            email: to,
        }
    ];

    client
        .send({
            from: sender,
            to: recipients,
            template_uuid: uuid,
            template_variables
        })
        .then(console.log, console.error);
}
export const receiveEmail = (from: string, subject: string, html: string) => {
    const TOKEN = process.env.MAIL_PASSWORD;
    const ENDPOINT = "https://send.api.mailtrap.io/";
    const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });
    const sender = {
        email: process.env.ADMIN_EMAIL,
        name: subject,
    };
    const recipients = [
        {
            email: process.env.ADMIN_EMAIL,
        }
    ];
    client
        .send({
            from: sender,
            to: recipients,
            subject: subject,
            text: html,
        })
        .then(console.log, console.error);
}
