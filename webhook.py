from flask import Flask, request, jsonify
import requests
import logging
from dotenv import load_dotenv
import os

load_dotenv() 

app = Flask(__name__)
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# Substitua estes pelos seus valoress
ACCESS_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1ZjAyMjU3NS1kOWZiLTRkNDgtOTAxZi1hMGJlYjYyODdiNDYiLCJpYXQiOjE3NTU1NDAwOTUsIm5iZiI6MTc1NTU0MDA5NCwic2NvcGUiOiJyYXNhOnBybyByYXNhOnBybzpjaGFtcGlvbiByYXNhOnZvaWNlIiwiZXhwIjoxODUwMjM0NDk0LCJlbWFpbCI6Im5pbHRvbmZlbGlwZUBnbWFpbC5jb20iLCJjb21wYW55IjoiUmFzYSBDaGFtcGlvbnMifQ.dYENEn4qw7gTocC8w7B5MnCu2MnRtgMM6ZBLdaNyOeb8P1PvLyLcaX5vqz-TrkpxF16SEd-LU7BUz66gNY9hcLkH-oRS1mDR2_ZsQZg_CkQoMhlWVfUh5MxSDKu974KaVsew-iZO0rFYKXQC3jt5eLn9OW6ahdyATbr0xEqS_L-DojL9eqgpq9TrqlmehGN3M9BLmYzmNRuJ3RFRdogxYrwGBIMZR_CFgAvmNJIZwVVuRiTL6lEpkeEJPL-oCfB97QhZuxDh0fT8XmrNbN7_Oir_3wcS7MjDIbfiQkibDqj7-qz0QQBM1aGzLzkNIsosocdb53vk-6nq6WqFjlsgtw"
PHONE_NUMBER_ID = "739119442607404"
API_URL = f"https://graph.facebook.com/v16.0/{PHONE_NUMBER_ID}/messages"
VERIFY_TOKEN = "123456"
FORWARD_API_URL = "http://localhost:5005/webhooks/rest/webhook"


def encaminhar_para_api(msg):
    """Encaminha o payload da mensagem para o Rasa e envia a resposta via WhatsApp."""
    sender = msg.get("from")
    message_body = msg.get("text", {}).get("body")

    if not sender or not message_body:
        logging.warning(
            f"Mensagem incompleta ou não textual para encaminhamento. Ignorando: {msg}"
        )
        return

    formatted_payload = {"sender": sender, "message": message_body}

    try:
        response = requests.post(FORWARD_API_URL, json=formatted_payload, timeout=5)
        response.raise_for_status()
        logging.info(
            f"Mensagem enviada ao Rasa. Status: {response.status_code}. Payload: {formatted_payload}"
        )

        rasa_responses = response.json()
        for r in rasa_responses:
            if "text" in r:
                resposta_texto = r["text"]
                enviar_mensagem(sender, resposta_texto)

    except requests.exceptions.RequestException as e:
        logging.error(
            f"Falha ao enviar para o Rasa em {FORWARD_API_URL}: {e}"
        )


def enviar_mensagem(numero_destino, mensagem):
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "x_api_key": os.getenv("X-API-KEY"),
        "Content-Type": "application/json",
    }
    data = {
        "messaging_product": "whatsapp",
        "to": numero_destino,
        "type": "text",
        "text": {"body": mensagem},
    }

    logging.info(f"Enviando payload para WhatsApp: {data}")

    try:
        response = requests.post(API_URL, headers=headers, json=data, timeout=10)
        response.raise_for_status()
        logging.info(
            f"Resposta enviada para {numero_destino}. Resposta da API: {response.json()}"
        )
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Erro ao enviar mensagem para {numero_destino}: {e}")
        if response is not None:
            logging.error(f"Resposta completa da API: {response.text}")
        return None



@app.route("/webhook", methods=["GET", "POST"])
def webhook():
    if request.method == "GET":
        # Validação do webhook
        token = request.args.get("hub.verify_token")
        challenge = request.args.get("hub.challenge")
        if token == VERIFY_TOKEN:
            logging.info("Webhook verificado com sucesso!")
            return challenge
        else:
            logging.warning("Falha na verificação do webhook: Token inválido.")
            return "Token inválido", 403

    elif request.method == "POST":
        data = request.get_json()
        logging.info(f"Payload recebido: {data}")
        # Processar mensagem recebida
        try:
            for entry in data.get("entry", []):
                for change in entry.get("changes", []):
                    value = change.get("value", {})
                    messages = value.get("messages", [])
                    for msg in messages:
                        # Encaminhar a mensagem completa para a outra API
                        encaminhar_para_api(
                            msg
                        )  # 'msg' é o payload original, a função 'encaminhar_para_api' fará a formatação

                        # Processar e responder apenas mensagens de texto
                        if msg.get("type") == "text":
                            from_number = msg.get("from")
                            mensagem_recebida = msg.get("text", {}).get("body")

                            if from_number and mensagem_recebida:
                                logging.info(
                                    f"Mensagem de {from_number}: {mensagem_recebida}"
                                )
                                # Responder automaticamente
                                # resposta = "Obrigado por entrar em contato!"
                                # enviar_mensagem(from_number, resposta)
        except Exception as e:
            logging.error(f"Erro ao processar o webhook: {e}", exc_info=True)
        return jsonify(status="ok"), 200  # Sempre retornar 200 para a API do WhatsApp


if __name__ == "__main__":
    app.run(port=5000, debug=True)
