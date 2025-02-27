import win32com.client

try:
    swApp = win32com.client.Dispatch("SldWorks.Application")
    
    if swApp is None:
        raise Exception("SolidWorks não pôde ser inicializado.")
    
    swApp.Visible = True  # Torna a interface visível
    print(f"Conectado ao SolidWorks! Versão: {swApp.RevisionNumber()}")
except Exception as e:
    print(f"Erro ao conectar ao SolidWorks: {e}")
