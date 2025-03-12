import os
import sys
from rembg import remove
from PIL import Image

def remove_background(image_path):
    """Remove o fundo da imagem especificada e mantém a transparência total."""
    if not os.path.exists(image_path):
        print(f"Erro: Arquivo não encontrado - {image_path}")
        return

    try:
        with open(image_path, "rb") as input_file:
            input_image = Image.open(input_file).convert("RGBA")  # Garante canal alfa (transparência)
            output_image = remove(input_image)

            # Remove qualquer fundo branco residual
            data = output_image.getdata()
            new_data = []
            for item in data:
                # Se o pixel for branco ou quase branco, torna transparente
                if item[:3] == (255, 255, 255) or sum(item[:3]) > 700:
                    new_data.append((255, 255, 255, 0))  # Transparente
                else:
                    new_data.append(item)

            output_image.putdata(new_data)

            # Salva a imagem sobrescrevendo a original
            output_image.save(image_path, "PNG")
            print(f"Fundo removido e imagem salva: {image_path}")

    except Exception as e:
        print(f"Erro ao processar {image_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        for image_path in sys.argv[1:]:
            remove_background(image_path)
    else:
        print("Nenhuma imagem especificada.")
