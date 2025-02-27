import win32com.client
import traceback

try:
    print("[LOG] Tentando conectar ao SolidWorks...")
    swApp = win32com.client.Dispatch("SldWorks.Application")

    if swApp is None:
        raise Exception("SolidWorks não pôde ser inicializado.")

    print("[LOG] SolidWorks conectado com sucesso.")

    try:
        versao = swApp.RevisionNumber()
        print(f"[LOG] Versão do SolidWorks: {versao}")
    except Exception as e:
        print(f"[ERRO] Falha ao obter a versão do SolidWorks: {e}")

    print("[LOG] Tentando obter todos os documentos abertos...")
    documents = swApp.GetDocuments  # Obtém todos os documentos abertos

    try:
        count = documents.Count
        print(f"[LOG] Número de documentos abertos: {count}")

        if count > 0:
            print("\n[LOG] Documentos abertos:")
            for i in range(count):
                try:
                    titulo = documents.Item(i).GetTitle()
                    print(f"- {titulo}")
                except Exception as e:
                    print(f"[ERRO] Falha ao obter o título do documento {i}: {e}")
        else:
            print("[LOG] Nenhum documento aberto.")

    except Exception as e:
        print(f"[ERRO] Falha ao acessar a lista de documentos: {e}")

except Exception as e:
    print(f"[ERRO CRÍTICO] Falha ao conectar ao SolidWorks: {e}")
    print("[DEBUG] Stack Trace:")
    print(traceback.format_exc())  # Exibe detalhes completos do erro
