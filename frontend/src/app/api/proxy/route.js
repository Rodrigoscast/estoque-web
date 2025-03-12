export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("imageUrl");
  
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "Imagem não especificada" }), { status: 400 });
    }
  
    try {
      const response = await fetch(decodeURIComponent(imageUrl), {
        headers: {
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === "true" && { "ngrok-skip-browser-warning": "true" }),
          },
      });
  
      if (!response.ok) throw new Error("Erro ao buscar a imagem");
  
      const contentType = response.headers.get("content-type");
      const imageBuffer = await response.arrayBuffer();
  
      return new Response(Buffer.from(imageBuffer), {
        headers: { "Content-Type": contentType },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
  