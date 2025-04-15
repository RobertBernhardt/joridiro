"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveEmail = exports.sendMail = void 0;
const mailtrap_1 = require("mailtrap");
const sendMail = (to, uuid, template_variables) => {
    const TOKEN = process.env.MAIL_PASSWORD;
    const ENDPOINT = "https://send.api.mailtrap.io/";
    const client = new mailtrap_1.MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });
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
};
exports.sendMail = sendMail;
const receiveEmail = (from, subject, html) => {
    const TOKEN = process.env.MAIL_PASSWORD;
    const ENDPOINT = "https://send.api.mailtrap.io/";
    const client = new mailtrap_1.MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });
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
};
exports.receiveEmail = receiveEmail;
