import os
import pandas as pd
import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk

# Criar pasta para imagens
output_folder = "imagens"
os.makedirs(output_folder, exist_ok=True)

def process_xls(file_path):
    try:
        df = pd.read_excel(file_path, header=0)  # Lê o arquivo ignorando o cabeçalho
        pecas = {}
        
        for index, row in df.iterrows():
            imagem_dados = row.iloc[0]  # Primeira coluna contém a imagem
            nome_peca = row.iloc[1]  # Segunda coluna contém o nome da peça
            quantidade = row.iloc[3]  # Quarta coluna contém a quantidade
            
            img_path = os.path.join(output_folder, f"{index}.png")
            if isinstance(imagem_dados, bytes):  # Garante que é um dado binário
                with open(os.path.join(output_folder, f"{index + 1}.jpg"), "wb") as img_file:
                    img_file.write(imagem_dados)
            else:
                print(f"Aviso: Linha {index + 1} não contém uma imagem válida.")
            
            pecas[nome_peca] = {"quantidade": quantidade, "imagem": img_path}
        
        return pecas
    except Exception as e:
        messagebox.showerror("Erro", f"Erro ao processar o arquivo: {str(e)}")
        return {}

def open_file():
    file_path = filedialog.askopenfilename(filetypes=[("Excel Files", "*.xls;*.xlsx")])
    if file_path:
        pecas = process_xls(file_path)
        show_pecas(pecas)

def show_pecas(pecas):
    for widget in frame.winfo_children():
        widget.destroy()
    
    for nome, dados in pecas.items():
        img = Image.open(dados["imagem"]).resize((50, 50))
        img = ImageTk.PhotoImage(img)
        
        frame_peca = tk.Frame(frame)
        frame_peca.pack(fill="x", padx=5, pady=2)
        
        label_img = tk.Label(frame_peca, image=img)
        label_img.image = img
        label_img.pack(side="left")
        
        label_text = tk.Label(frame_peca, text=f"{nome} - {dados['quantidade']} unidades")
        label_text.pack(side="left", padx=10)

# Criando a interface
top = tk.Tk()
top.title("Processador de Arquivos XLS")
top.geometry("400x500")

drag_label = tk.Label(top, text="Arraste ou selecione um arquivo .xls", padx=10, pady=10, relief="groove")
drag_label.pack(pady=10)

button = tk.Button(top, text="Selecionar Arquivo", command=open_file)
button.pack(pady=10)

canvas = tk.Canvas(top)
scrollbar = tk.Scrollbar(top, orient="vertical", command=canvas.yview)
scrollable_frame = tk.Frame(canvas)

scrollable_frame.bind(
    "<Configure>",
    lambda e: canvas.configure(
        scrollregion=canvas.bbox("all")
    )
)

canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
canvas.configure(yscrollcommand=scrollbar.set)

frame = tk.Frame(scrollable_frame)
frame.pack()

canvas.pack(side="left", fill="both", expand=True)
scrollbar.pack(side="right", fill="y")

top.mainloop()
