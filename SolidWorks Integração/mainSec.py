import win32com.client
import os
import requests
import tkinter as tk
from tkinter import messagebox, Listbox, MULTIPLE

ENDPOINT = "https://09cc-179-104-106-79.ngrok-free.app/endpoint/receber-dados"
API_KEY = 'populus_somnium_non_habet_finem'

# Função para obter nomes dos projetos abertos no SolidWorks
def get_open_projects():
    try:
        swApp = win32com.client.Dispatch("SldWorks.Application")

        if swApp is None:
            raise Exception("SolidWorks não pôde ser inicializado.")
    
        swApp.Visible = True

        print(f"Conectado ao SolidWorks! Versão: {swApp.RevisionNumber}")

        doc = swApp.GetFirstDocument()  # Obtém o primeiro documento
        projects = []
        
        while doc:
            projects.append(doc.GetTitle())  # Pega o nome do arquivo aberto
            doc = doc.GetNext()  # Passa para o próximo documento aberto
        
        return projects if projects else ["Nenhum projeto aberto"]
    except Exception as e:
        messagebox.showerror("Erro", f"Erro ao conectar ao SolidWorks: {e}")
        return []

# Função para enviar os projetos selecionados ao backend
def send_projects():
    selected_indices = listbox.curselection()
    selected_projects = [listbox.get(i) for i in selected_indices]
    
    if not selected_projects:
        messagebox.showwarning("Aviso", "Nenhum projeto selecionado!")
        return
    
    try:
        headers = {"x-api-key": API_KEY, "Content-Type": "application/json"}
        response = requests.post(ENDPOINT, headers=headers, json={"projetos": selected_projects})
        
        if response.status_code == 200:
            messagebox.showinfo("Sucesso", "Projetos enviados com sucesso!")
        else:
            messagebox.showerror("Erro", f"Erro ao enviar dados: {response.status_code} - {response.text}")
    except Exception as e:
        messagebox.showerror("Erro", f"Erro na requisição: {e}")

# Criando a interface gráfica
root = tk.Tk()
root.title("Enviar Projetos do SolidWorks")
root.geometry("400x300")

tk.Label(root, text="Selecione os projetos para enviar:").pack()
listbox = Listbox(root, selectmode=MULTIPLE)
listbox.pack(expand=True, fill="both")

projects = get_open_projects()
for project in projects:
    listbox.insert(tk.END, project)

tk.Button(root, text="Enviar", command=send_projects).pack()
root.mainloop()
