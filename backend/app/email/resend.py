import resend

from app.db.config import settings


def send_password_reset_email(recipient: str, reset_url: str) -> None:
    resend.api_key = settings.resend_api_key
    resend.Emails.send(
        {
            "from": settings.resend_from_email,
            "to": [recipient],
            "subject": "Recupera tu contraseña de Balance",
            "html": (
                "<p>Recibimos una solicitud para cambiar la "
                "contraseña de tu cuenta.</p>"
                f'<p><a href="{reset_url}">Restablecer contraseña</a></p>'
                f"<p>Este enlace expira en "
                f"{settings.password_reset_token_expire_minutes} minutos.</p>"
                "<p>Si no solicitaste este cambio, puedes ignorar este correo.</p>"
            ),
        }
    )
