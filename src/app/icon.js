import { ImageResponse } from "next/og";

// Configurações de tamanho e tipo do arquivo
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #7FB2E5, #0B2A4A)",
          color: "white",
          fontSize: 22,
          fontWeight: 800,
          borderRadius: 8, // Adicionei um leve arredondamento nas bordas, comum em favicons modernos
        }}
      >
        P
      </div>
    ),
    { ...size }
  );
}