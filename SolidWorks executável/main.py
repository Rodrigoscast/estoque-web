import zipfile
import os
import onnxruntime
from rembg import remove
from PIL import Image

def extract_images_from_excel(file_path, output_folder):
    # Cria a pasta de saída, se não existir
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Abre o arquivo Excel como um ZIP
    with zipfile.ZipFile(file_path, 'r') as zip_ref:
        # Filtra os arquivos que estão na pasta xl/media
        image_files = [f for f in zip_ref.namelist() if f.startswith("xl/media/") and not f.endswith('/')]

        if not image_files:
            print("Nenhuma imagem encontrada no arquivo Excel.")
            return

        for image_file in image_files:
            # Extrai o arquivo para a pasta de saída mantendo a estrutura
            zip_ref.extract(image_file, output_folder)
            source_path = os.path.join(output_folder, image_file)
            filename = os.path.basename(image_file)
            dest_path = os.path.join(output_folder, filename)
            os.rename(source_path, dest_path)

            # Remove o fundo da imagem
            remove_background(dest_path)

            print(f"Extraída e processada: {filename} para {output_folder}")

def remove_background(image_path):
    """Remove o fundo da imagem e salva com fundo transparente."""
    input_image = Image.open(image_path)
    output_image = remove(input_image).convert("RGBA")

    # Ajusta manualmente a transparência de pixels brancos
    data = output_image.getdata()
    new_data = []
    
    for item in data:
        # Se o pixel for muito claro (quase branco), torná-lo transparente
        if item[0] > 200 and item[1] > 200 and item[2] > 200:
            new_data.append((255, 255, 255, 0))  # Torna o pixel transparente
        else:
            new_data.append(item)

    output_image.putdata(new_data)

    new_image_path = image_path.replace(".", "_no_bg.")  # Renomeia adicionando "_no_bg"
    output_image.save(new_image_path, "PNG")  # Salva como PNG


if __name__ == "__main__":
    excel_file_path = "C:/Users/rodri/Desktop/teste123.xlsx"
    output_folder = "imagens"
    
    extract_images_from_excel(excel_file_path, output_folder)
