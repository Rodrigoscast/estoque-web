import os
import win32com.client
import requests
import tkinter as tk
from tkinter import ttk
from dotenv import load_dotenv
import time

# Carregar variáveis do .env
load_dotenv()

# Configuração do endpoint e API Key
ENDPOINT = "https://09cc-179-104-106-79.ngrok-free.app/endpoint/receber-dados"
API_KEY = os.getenv("API_SECRET_KEY")

def get_solidworks():
    """Tenta conectar ao SolidWorks até que ele seja encontrado."""
    while True:
        try:
            swApp = win32com.client.Dispatch("SldWorks.Application")
            print("SolidWorks conectado com sucesso.")
            return swApp
        except Exception as e:
            print("SolidWorks não encontrado, tentando novamente...")
            time.sleep(5)  # Aguarda 5 segundos antes de tentar novamente

def get_open_projects(swApp):
    """Obtém os projetos abertos no SolidWorks."""
    projects = []
    try:
        doc = swApp.ActiveDoc  # Alternativa para GetFirstDocument()
        while doc:
            projects.append((doc.GetTitle(), doc))
            doc = doc.GetNext()
        print("Projetos encontrados:", [p[0] for p in projects])
    except AttributeError as e:
        print(f"Erro ao acessar os documentos do SolidWorks: {e}")
        return []
    except Exception as e:
        print(f"Erro inesperado ao obter projetos: {e}")
    return projects

def extract_components(assembly):
    """Extrai os componentes e quantidades de uma montagem aberta no SolidWorks."""
    components = {}
    try:
        comp_enum = assembly.GetComponents(False)
        for comp in comp_enum:
            path = comp.GetPathName()
            quantity = comp.GetTotalQuantity()
            components[path] = quantity
        print("Componentes extraídos:", components)
    except Exception as e:
        print(f"Erro ao extrair componentes: {e}")
    return components

def capture_image(model):
    """Captura uma imagem do modelo ativo no SolidWorks e retorna os bytes da imagem."""
    try:
        image_path = os.path.join(os.getenv("TEMP"), model.GetTitle() + ".png")
        model.Extension.SaveAs(image_path, 0, 0, None, 0, 0)
        print(f"Imagem capturada: {image_path}")
        with open(image_path, "rb") as img_file:
            image_bytes = img_file.read()
        os.remove(image_path)  # Remove a imagem local após leitura
        return image_bytes
    except Exception as e:
        print(f"Erro ao capturar imagem: {e}")
        return None

def send_data(project_name, components, image_bytes):
    """Envia os dados para o endpoint protegido com API Key."""
    try:
        headers = {"x-api-key": API_KEY}
        data = {"project_name": project_name, "components": components}
        files = {"image": ("image.png", image_bytes, "image/png")} if image_bytes else None
        
        response = requests.post(ENDPOINT, headers=headers, data=data, files=files)
        print(f"Resposta do servidor: {response.status_code}, {response.text}")
    except Exception as e:
        print(f"Erro ao enviar dados: {e}")

def process_project(swApp, doc):
    """Processa o projeto selecionado e envia os dados."""
    try:
        project_name = doc.GetTitle()
        print(f"Processando projeto: {project_name}")
        components = extract_components(doc) if doc.GetType() == 2 else {}
        image_bytes = capture_image(doc)
        send_data(project_name, components, image_bytes)
    except Exception as e:
        print(f"Erro ao processar projeto: {e}")

def create_gui():
    """Cria a interface gráfica para seleção de projetos."""
    try:
        root = tk.Tk()
        root.title("Seleção de Projeto - SolidWorks")
        root.geometry("500x300")  # Define tamanho da janela
        
        tk.Label(root, text="Aguardando conexão com SolidWorks...").pack(pady=5)
        root.update()
        
        swApp = get_solidworks()  # Aguarda até encontrar o SolidWorks
        
        projects = get_open_projects(swApp)
        if not projects:
            print("Nenhum projeto aberto no SolidWorks.")
            return
        
        tk.Label(root, text="Selecione um projeto:").pack(pady=5)
        project_var = tk.StringVar()
        project_dropdown = ttk.Combobox(root, textvariable=project_var, values=[p[0] for p in projects])
        project_dropdown.pack(pady=5)
        
        def on_submit():
            selected_project = project_var.get()
            for name, doc in projects:
                if name == selected_project:
                    process_project(swApp, doc)
                    break
            root.destroy()
        
        tk.Button(root, text="Enviar Dados", command=on_submit).pack(pady=10)
        root.mainloop()
    except Exception as e:
        print(f"Erro na interface gráfica: {e}")

if __name__ == "__main__":
    try:
        create_gui()
    except Exception as e:
        print(f"Erro crítico ao executar o programa: {e}")
