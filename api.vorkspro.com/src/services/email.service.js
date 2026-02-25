import fs from 'fs';
import nodemailer from 'nodemailer';
import { User, Config } from '../startup/models.js';
import moment from 'moment';

export const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    tls: {
        rejectUnauthorized: false,
    },
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

export async function sendEmailOnRegistration(email, code) {
    try {
        const thisUser = await User.findOne({ email });
        if (!thisUser) {
            console.error('Error: User not found for the given email:', email);
            return;
        }

        const filePath = thisUser?.language === 'ar' ? 'src/templates/userRegistrationAr.html' : 'src/templates/userRegistration.html';
        const htmlString = fs.readFileSync(filePath, 'utf8');

        if (!htmlString) {
            console.error('Error: Email template file is empty or missing.');
            return;
        }

        let template = htmlString;
        const currentYear = moment().year();

        template = template.split('||YEAR||').join(currentYear);
        template = template.split('||CODE||').join(code);
        template = template.split('||USERNAME||').join(thisUser?.name || 'User');
        template = template.split('||NAME||').join(thisUser?.name || 'User');
        template = template.split('||EMAIL||').join(email);

        const companyName = await Config.findOne({ keyName: 'companyName' });
        const companyWeb = await Config.findOne({ keyName: 'companyWeb' });
        const companyAPI = await Config.findOne({ keyName: 'companyAPI' });

        template = template.split('||COMPANYNAME||').join(companyName?.keyValue || 'Connect');
        template = template.split('||COMPANYWEB||').join(companyWeb?.keyValue || 'www.connect.com');
        template = template.split('||COMPANYAPI||').join(companyAPI?.keyValue || 'api.connect.com');

        const subject = thisUser?.language === 'ar'
            ? `شكرًا لك على التسجيل في ${companyName?.keyValue || 'Connect'}`
            : `Thank you for Registering with ${companyName?.keyValue || 'Connect'}`;

        await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: email,
            subject,
            html: template,
            replyTo: process.env.FROM_EMAIL,
        });
    } catch (error) {
        console.error('Error in sending registration email:', error);
    }
}

export async function sendEmailForResetCode(email, code, name, language = 'en') {
    try {
        const fileName = language === 'ar' ? 'src/templates/resetPasswordAr.html' : 'src/templates/resetPassword.html';
        const htmlString = fs.readFileSync(fileName, 'utf8');

        if (!htmlString) {
            console.error('Error: Email template file is empty or missing.');
            return;
        }

        let template = htmlString;
        const currentYear = moment().year();

        template = template.split('||YEAR||').join(currentYear);
        template = template.split('||USERNAME||').join(name || 'User');
        template = template.split('||USEREMAIL||').join(email);
        template = template.split('||CODE||').join(code);

        const thisCompanyName = await Config.findOne({ keyName: 'companyName' });
        const thisCompanyWeb = await Config.findOne({ keyName: 'companyWeb' });
        const thisCompanyAPI = await Config.findOne({ keyName: 'companyAPI' });

        template = template.split('||COMPANYNAME||').join(thisCompanyName?.keyValue || 'Connect');
        template = template.split('||COMPANYWEB||').join(thisCompanyWeb?.keyValue || 'www.connect.com');
        template = template.split('||COMPANYAPI||').join(thisCompanyAPI?.keyValue || 'api.connect.com');

        const mailData = {
            from: process.env.FROM_EMAIL,
            to: email,
            bcc: email,
            subject: `Reset Password`,
            html: template,
            replyTo: process.env.FROM_EMAIL,
        };

        const info = await transporter.sendMail(mailData);
        console.log('Reset password email sent successfully:', info);
    } catch (error) {
        console.error('Error in sending reset password email:', error);
    }
}

export async function sendZoomMeetingEmail(email, meetingLink, password, name, language = 'en', date, time, duration) {
    try {
        const fileName = language === 'ar' ? 'src/templates/zoomMeetingAr.html' : 'src/templates/zoomMeeting.html';

        // Fallback to inline HTML if template file doesn't exist
        let template = `
        <!DOCTYPE html>
        <html lang="${language}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Zoom Meeting Details</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                    direction: ${language === 'ar' ? 'rtl' : 'ltr'};
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background: linear-gradient(90deg, #4b6cb7, #182848);
                    padding: 30px;
                    text-align: center;
                    color: #ffffff;
                }
                .header h1 {
                    margin: 0;
                    font-size: 26px;
                    font-weight: 600;
                }
                .content {
                    padding: 40px 30px;
                    text-align: ${language === 'ar' ? 'right' : 'left'};
                }
                .content p {
                    font-size: 16px;
                    line-height: 1.6;
                    margin: 0 0 20px;
                }
                .meeting-details {
                    background-color: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    text-align: ${language === 'ar' ? 'right' : 'left'};
                }
                .meeting-details p {
                    margin: 10px 0;
                    font-size: 16px;
                    display: flex;
                    justify-content: space-between;
                }
                .meeting-details strong {
                    color: #182848;
                    width: 120px;
                }
                .button {
                    display: inline-block;
                    padding: 14px 30px;
                    background-color: #4b6cb7;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: 500;
                    transition: background-color 0.3s;
                    text-align: center;
                    margin: 20px auto;
                    display: block;
                    width: fit-content;
                }
                .button:hover {
                    background-color: #182848;
                }
                .footer {
                    background-color: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    font-size: 14px;
                    color: #666;
                }
                .footer a {
                    color: #4b6cb7;
                    text-decoration: none;
                    margin: 0 10px;
                }
                @media (max-width: 600px) {
                    .container {
                        margin: 10px;
                    }
                    .content {
                        padding: 20px;
                    }
                    .header h1 {
                        font-size: 22px;
                    }
                    .meeting-details p {
                        flex-direction: column;
                        gap: 5px;
                    }
                    .meeting-details strong {
                        width: auto;
                    }
                    .button {
                        padding: 12px 20px;
                        font-size: 14px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${language === 'ar' ? 'تفاصيل اجتماع زوم الخاص بك' : 'Your Zoom Meeting Details'}</h1>
                </div>
                <div class="content">
                    <p>${language === 'ar' ? `مرحبًا ${name || 'User'}،` : `Hello ${name || 'User'},`}</p>
                    <p>${language === 'ar' ? 'تم جدولة اجتماع زوم الخاص بك. يرجى الاطلاع على التفاصيل أدناه للانضمام:' : 'Your Zoom meeting has been scheduled. Below are the details you need to join:'}</p>
                    <div class="meeting-details">
                        <p><strong>${language === 'ar' ? 'التاريخ:' : 'Date:'}</strong> ||DATE||</p>
                        <p><strong>${language === 'ar' ? 'الوقت:' : 'Time:'}</strong> ||TIME||</p>
                        <p><strong>${language === 'ar' ? 'المدة:' : 'Duration:'}</strong> ||DURATION||</p>
                        <p><strong>${language === 'ar' ? 'رابط الاجتماع:' : 'Meeting Link:'}</strong> <a href="||MEETINGLINK||">${language === 'ar' ? 'انضم إلى الاجتماع' : 'Join Meeting'}</a></p>
                        <p><strong>${language === 'ar' ? 'كلمة المرور:' : 'Password:'}</strong> ||PASSWORD||</p>
                    </div>
                    <p>${language === 'ar' ? 'يرجى الاحتفاظ بهذه المعلومات آمنة والانضمام إلى الاجتماع في الوقت المحدد.' : 'Please keep this information secure and join the meeting at the scheduled time.'}</p>
                    <a href="||MEETINGLINK||" class="button">${language === 'ar' ? 'انضم إلى الاجتماع الآن' : 'Join Meeting Now'}</a>
                    <p>${language === 'ar' ? 'إذا كانت لديك أي أسئلة، يرجى التواصل مع فريق الدعم.' : 'If you have any questions, please contact our support team.'}</p>
                    <p>${language === 'ar' ? 'شكرًا لك،<br>فريق ||COMPANYNAME||' : 'Thank you,<br>||COMPANYNAME|| Team'}</p>
                </div>
                <div class="footer">
                    <p>© ||YEAR|| ||COMPANYNAME||. ${language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
                    <p><a href="||COMPANYWEB||">${language === 'ar' ? 'زيارة الموقع' : 'Visit Website'}</a> | <a href="||COMPANYAPI||/support">${language === 'ar' ? 'الاتصال بالدعم' : 'Contact Support'}</a></p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Try to read template file if it exists
        try {
            template = fs.readFileSync(fileName, 'utf8');
        } catch (err) {
            console.log(`Using fallback template as ${fileName} not found`);
        }

        const currentYear = moment().year();
        const formattedDate = moment(date).format(language === 'ar' ? 'D MMMM YYYY' : 'MMMM D, YYYY');
        const formattedTime = moment(`${date}T${time}`).format('h:mm A');
        const formattedDuration = `${duration} ${language === 'ar' ? 'دقيقة' : 'minutes'}`;

        // Replace placeholders
        template = template.split('||YEAR||').join(currentYear);
        template = template.split('||USERNAME||').join(name || 'User');
        template = template.split('||MEETINGLINK||').join(meetingLink);
        template = template.split('||PASSWORD||').join(password);
        template = template.split('||DATE||').join(formattedDate);
        template = template.split('||TIME||').join(formattedTime);
        template = template.split('||DURATION||').join(formattedDuration);

        // Fetch company details
        const thisCompanyName = await Config.findOne({ keyName: 'companyName' });
        const thisCompanyWeb = await Config.findOne({ keyName: 'companyWeb' });
        const thisCompanyAPI = await Config.findOne({ keyName: 'companyAPI' });

        template = template.split('||COMPANYNAME||').join(thisCompanyName?.keyValue || 'Connect');
        template = template.split('||COMPANYWEB||').join(thisCompanyWeb?.keyValue || 'www.connect.com');
        template = template.split('||COMPANYAPI||').join(thisCompanyAPI?.keyValue || 'api.connect.com');

        const subject = language === 'ar'
            ? `تفاصيل اجتماع زوم الخاص بك مع ${thisCompanyName?.keyValue || 'Connect'}`
            : `Your Zoom Meeting Details with ${thisCompanyName?.keyValue || 'Connect'}`;

        const mailData = {
            from: process.env.FROM_EMAIL,
            to: email,
            bcc: email,
            subject,
            html: template,
            replyTo: process.env.FROM_EMAIL,
        };

        const info = await transporter.sendMail(mailData);
        console.log('Zoom meeting email sent successfully:', info);
    } catch (error) {
        console.error('Error in sending Zoom meeting email:', error);
    }
}

export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to,
            subject,
            text,
            html,
        });
    } catch (error) {
        console.error('Error in sending email:', error);
    }
};