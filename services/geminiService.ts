import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AgentType } from "../types";

// Safety check for API Key
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

const getSystemInstruction = (agentType: AgentType): string => {
  const baseInstruction = `
    Anda adalah SIAK-Klinis (Sistem Intelijen Rumah Sakit Koordinator).
    Konteks: Integrasi sistem rumah sakit di Indonesia, mematuhi UU PDP, Permenkes RME, dan Pedoman BLU.
  `;

  switch (agentType) {
    case AgentType.CLINICAL:
      return `${baseInstruction}
      PERAN: Sub-Agen Rekam Medis & Diagnosis (RME & Clinical AI).
      TUGAS:
      1. Menganalisis input klinis (teks atau gambar medis seperti X-ray).
      2. Meringkas riwayat medis tidak terstruktur.
      3. Memberikan *opini kedua* berdasarkan data visual.
      GUARDRAILS:
      - WAJIB menyertakan DISCLAIMER: "Analisis ini hanya bersifat informasional dan BUKAN pengganti diagnosis dokter."
      - Fokus pada terminologi medis yang akurat.
      - Jaga kerahasiaan data pasien.
      `;
    
    case AgentType.BILLING:
      return `${baseInstruction}
      PERAN: Sub-Agen Penagihan dan Akuntansi (BLU & Klaim BPJS).
      TUGAS:
      1. Menjelaskan detail tagihan dan komponen biaya.
      2. Membantu rekonsiliasi klaim BPJS (Analisis BAV - Berita Acara Verifikasi).
      3. Menghitung CRR (Cost Recovery Rate).
      4. Menyusun draft laporan keuangan BLU (Neraca, Arus Kas).
      TONE: Profesional, akurat secara numerik, paham regulasi keuangan RS Pemerintah.
      `;
    
    case AgentType.OPERATIONAL:
      return `${baseInstruction}
      PERAN: Sub-Agen Manajemen Operasional & Penjadwalan.
      TUGAS:
      1. Manajemen janji temu (booking/cancellation).
      2. Optimasi alokasi ruang dan dokter.
      3. Efisiensi alur pasien (Patient Flow).
      TONE: Efisien, ramah, dan solutif.
      `;

    case AgentType.COORDINATOR:
    default:
      return `${baseInstruction}
      PERAN: Koordinator Utama (Router).
      TUGAS:
      1. Menganalisis intensi pengguna.
      2. Jika pertanyaan spesifik, sarankan pengguna untuk beralih ke Tab Agen yang relevan (Klinis, Keuangan, Operasional).
      3. Jika pertanyaan umum, jawab langsung secara ringkas.
      4. Bertindak sebagai "Front Desk" cerdas.
      `;
  }
};

const getModelForAgent = (agentType: AgentType, hasImage: boolean) => {
  if (hasImage) {
    // Clinical agent analyzing X-rays needs a vision-capable model
    return 'gemini-2.5-flash-image';
  }
  
  if (agentType === AgentType.BILLING) {
     // Reasoning model for complex calculations or regulation interpretation
     // Using standard flash for speed, but could be pro if reasoning budget needed
     return 'gemini-2.5-flash';
  }

  // Default for text chat
  return 'gemini-2.5-flash';
};

export const sendMessageToGemini = async (
  agentType: AgentType,
  message: string,
  imageBase64?: string | null
): Promise<string> => {
  if (!apiKey) return "Error: API Key is missing.";

  const systemInstruction = getSystemInstruction(agentType);
  const modelName = getModelForAgent(agentType, !!imageBase64);

  try {
    const parts: any[] = [];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/png', // Simplified assumption for demo, real app detects MIME
          data: imageBase64
        }
      });
    }

    parts.push({ text: message });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4, // Keep it relatively factual for hospital context
      },
    });

    return response.text || "Maaf, saya tidak dapat menghasilkan respons saat ini.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Terjadi kesalahan saat menghubungi server AI. Pastikan koneksi internet stabil atau coba lagi nanti.";
  }
};