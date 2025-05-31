import tkinter as tk
from tkinter import filedialog, messagebox
import requests
import jwt  # PyJWT para gerar o token JWT
import os

# CONFIGURAÇÕES DO ENDPOINT
API_URL = "https://estoque-0j31.onrender.com/endpoint/receber-dados"
SECRET_KEY = "populus_somnium_non_habet_finem"

def generate_jwt():
    """Gera um token JWT para autenticação"""
    payload = {"user": "admin"}  # Pode adicionar mais dados conforme necessário
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

def select_folder():
    """Abre a janela para selecionar a pasta do projeto"""
    folder_path = filedialog.askdirectory(title="Selecione a pasta do projeto")
    
    if not folder_path:
        return
    
    rename_files(folder_path)
    selected_folder.set(folder_path)
    list_xlsx_files(folder_path)

def list_xlsx_files(folder_path):
    """Lista os arquivos .xlsx na pasta selecionada"""
    xlsx_files = [f for f in os.listdir(folder_path) if f.endswith(".xlsx")]
    png_files = [f for f in os.listdir(folder_path) if f.endswith((".png", ".PNG"))]

    if not xlsx_files:
        messagebox.showerror("Erro", "Nenhum arquivo .xlsx encontrado na pasta selecionada.")
        return
    
    # Limpa a lista e adiciona os arquivos encontrados
    listbox_files.delete(0, tk.END)
    for file in xlsx_files:
        listbox_files.insert(tk.END, file)
    
    selected_files.set("\n".join(xlsx_files))
    
    # Verifica se há um arquivo PNG
    if png_files:
        selected_image.set(os.path.join(folder_path, png_files[0]))
    else:
        selected_image.set("")
    
    # Habilita a seleção do projeto principal
    btn_select_main["state"] = tk.NORMAL

def rename_files(folder_path):
    """Renomeia arquivos .xlsx na pasta, substituindo _ por espaço"""
    xlsx_files = [f for f in os.listdir(folder_path) if f.endswith(".xlsx")]
    renamed_files = []

    for file in xlsx_files:
        new_name = file.replace("_", " ")  # Substitui os underscores por espaços
        old_path = os.path.join(folder_path, file)
        new_path = os.path.join(folder_path, new_name)

        if file != new_name:
            try:
                os.rename(old_path, new_path)  # Renomeia o arquivo no sistema
            except Exception as e:
                new_name = file  # Mantém o nome original se houver erro

        renamed_files.append(new_name)

    return renamed_files  # Retorna a lista de arquivos renomeados

def select_main_project():
    """Define qual arquivo .xlsx será o principal"""
    selected_index = listbox_files.curselection()
    
    if not selected_index:
        messagebox.showerror("Erro", "Selecione o projeto principal da lista.")
        return
    
    selected_file = listbox_files.get(selected_index)
    
    main_project.set(selected_file)
    btn_send["state"] = tk.NORMAL


def send_files():
    """Envia os arquivos e a imagem para o backend"""
    folder_path = selected_folder.get()
    files = selected_files.get().split("\n")
    main_project_file = main_project.get()
    image_path = selected_image.get()
    
    if not folder_path or not files or not main_project_file:
        messagebox.showerror("Erro", "Selecione a pasta e o projeto principal.")
        return
    
    headers = {"Authorization": f"Bearer {generate_jwt()}"}
    file_data = [("files", (f, open(os.path.join(folder_path, f), "rb"))) for f in files]
    data = {"mainProject": main_project_file}
    
    # Adiciona a imagem se houver
    if image_path:
        file_data.append(("image", (os.path.basename(image_path), open(image_path, "rb"))))
    
    try:
        response = requests.post(API_URL, files=file_data, data=data, headers=headers)
        response.raise_for_status()
        messagebox.showinfo("Sucesso", "Arquivos enviados com sucesso!")
    except requests.exceptions.RequestException as e:
        messagebox.showerror("Erro", f"Erro ao enviar os arquivos: {e}")

# Criando a interface gráfica
root = tk.Tk()
root.title("Uploader de Projetos XLSX")
root.geometry("500x500")

selected_folder = tk.StringVar()
selected_files = tk.StringVar()
main_project = tk.StringVar()
selected_image = tk.StringVar()

tk.Label(root, text="Selecione a pasta do projeto").pack(pady=5)
btn_select_folder = tk.Button(root, text="Selecionar Pasta", command=select_folder)
btn_select_folder.pack(pady=5)

tk.Label(root, text="Arquivos XLSX encontrados:").pack(pady=5)
listbox_files = tk.Listbox(root, width=60, height=10)
listbox_files.pack(pady=5)

btn_select_main = tk.Button(root, text="Selecionar Projeto Principal", command=select_main_project, state=tk.DISABLED)
btn_select_main.pack(pady=5)

tk.Label(root, text="Projeto Principal Selecionado:").pack(pady=5)
tk.Label(root, textvariable=main_project, wraplength=450, fg="blue").pack(pady=5)

btn_send = tk.Button(root, text="Enviar Arquivos", command=send_files, state=tk.DISABLED)
btn_send.pack(pady=20)

root.mainloop()