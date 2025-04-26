from flask_mail import Message
from app import mail
from flask import current_app


def send_email(to, subject, body):
    try:
        msg = Message(
            subject,
            sender=current_app.config['MAIL_USERNAME'],
            recipients=[to]
        )
        msg.body = body
        mail.send(msg)
        current_app.logger.info(f"Email alert sent to {to}")
    except Exception as e:
        current_app.logger.error(f"Failed to send email alert to {to}: {e}")
