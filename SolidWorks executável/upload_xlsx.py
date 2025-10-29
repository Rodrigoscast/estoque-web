import tkinter as tk
from tkinter import filedialog, messagebox
import requests
import jwt
import os
import traceback

API_URL = "http://localhost:3000/endpoint/receber-dados"

def generate_jwt():
    """Gera um token JWT para autenticação"""
    payload = {"user": "admin"}
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    print(f"[JWT] Token gerado: {token}")
    return token

def select_folder():
    print("[DEBUG] Abrindo seletor de pasta...")
    folder_path = filedialog.askdirectory(title="Selecione a pasta do projeto")
    if not folder_path:
        print("[DEBUG] Nenhuma pasta selecionada.")
        return
    print(f"[DEBUG] Pasta selecionada: {folder_path}")

    rename_files(folder_path)
    selected_folder.set(folder_path)
    list_xlsx_files(folder_path)

def list_xlsx_files(folder_path):
    print(f"[DEBUG] Listando arquivos .xlsx e .png em: {folder_path}")
    xlsx_files = [f for f in os.listdir(folder_path) if f.endswith(".xlsx")]
    png_files = [f for f in os.listdir(folder_path) if f.endswith((".png", ".PNG"))]
    print(f"[DEBUG] XLSX encontrados: {xlsx_files}")
    print(f"[DEBUG] PNG encontrados: {png_files}")

    if not xlsx_files:
        messagebox.showerror("Erro", "Nenhum arquivo .xlsx encontrado na pasta selecionada.")
        return
    
    listbox_files.delete(0, tk.END)
    for file in xlsx_files:
        listbox_files.insert(tk.END, file)
    selected_files.set("\n".join(xlsx_files))

    if png_files:
        selected_image.set(os.path.join(folder_path, png_files[0]))
    else:
        selected_image.set("")
    
    btn_select_main["state"] = tk.NORMAL

def rename_files(folder_path):
    print("[DEBUG] Renomeando arquivos .xlsx...")
    xlsx_files = [f for f in os.listdir(folder_path) if f.endswith(".xlsx")]
    renamed_files = []

    for file in xlsx_files:
        new_name = file.replace("_", " ")
        old_path = os.path.join(folder_path, file)
        new_path = os.path.join(folder_path, new_name)

        if file != new_name:
            try:
                os.rename(old_path, new_path)
                print(f"[DEBUG] Renomeado: {file} -> {new_name}")
            except Exception as e:
                print(f"[ERRO] Falha ao renomear {file}: {e}")
                new_name = file

        renamed_files.append(new_name)
    return renamed_files

def select_main_project():
    print("[DEBUG] Selecionando projeto principal...")
    selected_index = listbox_files.curselection()
    if not selected_index:
        messagebox.showerror("Erro", "Selecione o projeto principal da lista.")
        print("[ERRO] Nenhum projeto selecionado.")
        return
    
    selected_file = listbox_files.get(selected_index)
    print(f"[DEBUG] Projeto principal selecionado: {selected_file}")
    main_project.set(selected_file)
    btn_send["state"] = tk.NORMAL

def send_files():
    print("[DEBUG] Iniciando envio de arquivos...")
    folder_path = selected_folder.get()
    files = selected_files.get().split("\n")
    main_project_file = main_project.get()
    image_path = selected_image.get()

    print(f"[DEBUG] Pasta: {folder_path}")
    print(f"[DEBUG] Arquivos: {files}")
    print(f"[DEBUG] Projeto principal: {main_project_file}")
    print(f"[DEBUG] Imagem: {image_path}")

    if not folder_path or not files or not main_project_file:
        messagebox.showerror("Erro", "Selecione a pasta e o projeto principal.")
        print("[ERRO] Campos obrigatórios faltando.")
        return
    
    headers = {"Authorization": f"Bearer {generate_jwt()}"}
    file_data = []

    try:
        for f in files:
            path = os.path.join(folder_path, f)
            print(f"[DEBUG] Adicionando arquivo: {path}")
            file_data.append(("files", (f, open(path, "rb"))))

        if image_path:
            print(f"[DEBUG] Adicionando imagem: {image_path}")
            file_data.append(("image", (os.path.basename(image_path), open(image_path, "rb"))))
        
        data = {"mainProject": main_project_file}
        print(f"[DEBUG] Enviando POST para {API_URL}...")
        response = requests.post(API_URL, files=file_data, data=data, headers=headers)

        print(f"[DEBUG] Status code: {response.status_code}")
        print(f"[DEBUG] Resposta: {response.text}")

        response.raise_for_status()
        messagebox.showinfo("Sucesso", "Arquivos enviados com sucesso!")
        print("[SUCESSO] Arquivos enviados com sucesso!")
    except requests.exceptions.RequestException as e:
        print("[ERRO] Erro de requisição:")
        traceback.print_exc()
        messagebox.showerror("Erro", f"Erro ao enviar os arquivos: {e}")
    except Exception as e:
        print("[ERRO] Erro inesperado:")
        traceback.print_exc()
        messagebox.showerror("Erro", f"Erro inesperado: {e}")

# GUI
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
