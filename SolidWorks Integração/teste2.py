import win32com.client
import traceback

try:
    print("[LOG] Tentando conectar ao SolidWorks...")
    swApp = win32com.client.Dispatch("SldWorks.Application")

    if swApp is None:
        raise Exception("SolidWorks não pôde ser inicializado.")
    
    swApp.Visible = True  # Torna a interface visível
    print("[LOG] SolidWorks iniciado com sucesso.")

    try:
        versao = swApp.RevisionNumber()
        print(f"[LOG] Versão do SolidWorks: {versao}")
    except Exception as e:
        print(f"[ERRO] Falha ao obter a versão do SolidWorks: {e}")

    print("[LOG] Tentando obter o documento ativo...")
    doc = swApp.ActiveDoc  # Obtém o documento ativo

    if doc:
        try:
            titulo = doc.GetTitle()
            print(f"[LOG] Documento ativo: {titulo}")
        except Exception as e:
            print(f"[ERRO] Falha ao obter o título do documento: {e}")
    else:
        print("[LOG] Nenhum documento aberto.")

except Exception as e:
    print(f"[ERRO CRÍTICO] Falha ao conectar ao SolidWorks: {e}")
    print("[DEBUG] Stack Trace:")
    print(traceback.format_exc())  # Exibe detalhes completos do erro
