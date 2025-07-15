import requests
import time
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

from dotenv import load_dotenv
import os

load_dotenv()  

backend_url = os.getenv("BACKEND_URL")

class ActionVerificarCliente(Action):

    def name(self) -> Text:
        return "action_verificar_cliente"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        
        numero = tracker.sender_id
        url = f"{backend_url}clientes/consulta-cliente-telefone/{numero}"

        try:
            response = requests.get(url)
            if response.status_code == 404:
                dispatcher.utter_message(response="utter_saudacao_usuario_sem_cadastro")
                return [SlotSet("tem_cadastro", False)]

            elif response.status_code == 200:
                data = response.json()
                nome = data.get("nome_cliente")
                tem_agendamento = data.get("tem_agendamento", False)
                agendamentos = data.get("agendamentos", [])

                if tem_agendamento and agendamentos:
                    agendamento = agendamentos[0]
                    dispatcher.utter_message(
                        response="utter_saudacao_usuario_com_cadastro_com_agendamento",
                        nome=nome,
                    )
                    return [
                        SlotSet("tem_cadastro", True),
                        SlotSet("nome", nome),
                        SlotSet("agendamento_ativo", True),
                        SlotSet("data_agendada", agendamento.get("dia_agendado")),
                        SlotSet("turno_agendado", agendamento.get("turno_agendado")),
                    ]
                else:
                    dispatcher.utter_message(
                        response="utter_saudacao_usuario_com_cadastro_sem_agendamento",
                        nome=nome,
                    )
                    return [
                        SlotSet("tem_cadastro", True),
                        SlotSet("nome", nome),
                        SlotSet("agendamento_ativo", False),
                        SlotSet("data_agendada", None),
                        SlotSet("turno_agendado", None),
                    ]
            else:
                dispatcher.utter_message(text="Erro ao verificar o cadastro. Tente novamente mais tarde.")
                return []

        except requests.exceptions.RequestException as e:
            dispatcher.utter_message(text="Erro de conexão com o servidor. Tente novamente mais tarde.")
            print(f"Erro {e}")
            return []

class ActionAgendarColeta(Action):

    def name(self) -> Text:
        return "action_agendar_coleta"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        numero = tracker.sender_id
        data = tracker.get_slot("nova_data")
        turno = tracker.get_slot("novo_turno")

        if not data or not turno:
            dispatcher.utter_message(text="Por favor, informe a data e o turno para o agendamento.")
            return []

        url = f"{backend_url}agendamentos/telefone"

        payload = {
            "telefone_cliente": numero,
            "dia_agendado": data,
            "turno_agendado": turno,
            "id_cliente": 2,
            "id_usuario": 1,  
            "observacoes": "Agendado via chatbot"
        }

        try:
            response = requests.post(url, json=payload, timeout=10)
        except requests.exceptions.Timeout:
            dispatcher.utter_message(text="O servidor demorou para responder. Tente novamente em instantes.")
            return []

        if response.status_code == 201:
            dispatcher.utter_message(
                text=f"Seu agendamento foi registrado com sucesso para o dia {data} no turno da {turno}!"
            )
            return [
                SlotSet("agendamento_ativo", True),
                SlotSet("data_agendada", data),
                SlotSet("turno_agendado", turno),
                SlotSet("nova_data", None),
                SlotSet("novo_turno", None),
            ]
        else:
            try:
                erro = response.json().get("error") or response.json().get("erro")
            except:
                erro = "Erro desconhecido"

            dispatcher.utter_message(text=f"Não foi possível realizar o agendamento: {erro}")
            return []

class ActionRemarcarColeta(Action):
    def name(self) -> Text:
        return "action_remarcar_coleta"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        numero = tracker.sender_id
        nova_data = tracker.get_slot("nova_data")
        novo_turno = tracker.get_slot("novo_turno")

        if not nova_data or not novo_turno:
            dispatcher.utter_message(text="Por favor, informe a nova data e o novo turno para a remarcação.")
            return []
        try:
            url = f"{backend_url}agendamentos/telefone/{numero}"
            payload = {
                "dia_agendado": nova_data,
                "turno_agendado": novo_turno,
                "observacoes": "Remarcado pelo chatbot"
            }

            response = requests.put(url, json=payload, timeout=10)

            if response.status_code == 200:
                dispatcher.utter_message(text=f"Seu agendamento foi remarcado para o dia {nova_data} no turno da {novo_turno}.")
                return [
                    SlotSet("data_agendada", nova_data),
                    SlotSet("turno_agendado", novo_turno),
                    SlotSet("nova_data", None),
                    SlotSet("novo_turno", None)
                ]
            elif response.status_code == 404:
                dispatcher.utter_message(text="Não encontrei um agendamento anterior para ser remarcado.")
            else:
                dispatcher.utter_message(text="Ocorreu um erro ao tentar remarcar. Tente novamente mais tarde.")

        except requests.exceptions.Timeout:
            dispatcher.utter_message(text="Houve um tempo de espera muito grande. Tente novamente em instantes.")
        except Exception as e:
            dispatcher.utter_message(text=f"Erro inesperado: {str(e)}")

        return []
    
class ActionCancelarColeta(Action):

    def name(self) -> Text:
        return "action_cancelar_coleta"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        numero = tracker.sender_id
        data_agendada = tracker.get_slot("data_agendada")
        turno_agendado = tracker.get_slot("turno_agendado")

        print(f"[INFO] Tentando cancelar agendamento para telefone: {numero}")
        print(f"[INFO] Data: {data_agendada}, Turno: {turno_agendado}")

        if not data_agendada or not turno_agendado:
            dispatcher.utter_message(text="Você não possui agendamento ativo para cancelar.")
            return []

        try:
            url = f"{backend_url}agendamentos/telefone/{numero}"
            print(f"[INFO] Fazendo DELETE em: {url}")

            response = requests.delete(url, timeout=10)
            print(f"[INFO] Status: {response.status_code}, Resposta: {response.text}")

            if response.status_code == 200:
                dispatcher.utter_message(
                    text=f"Seu agendamento de {data_agendada} ({turno_agendado}) foi cancelado com sucesso."
                )
                return [
                    SlotSet("agendamento_ativo", False),
                    SlotSet("data_agendada", None),
                    SlotSet("turno_agendado", None),
                ]

            elif response.status_code == 404:
                dispatcher.utter_message(text="Nenhum agendamento pendente encontrado para este número.")
                return []

            else:
                dispatcher.utter_message(text="Erro ao tentar cancelar o agendamento. Tente novamente.")
                return []

        except requests.RequestException as e:
            dispatcher.utter_message(text="Erro de conexão com o servidor. Tente novamente mais tarde.")
            print(f"[ERRO] Cancelamento falhou: {e}")
            return []
