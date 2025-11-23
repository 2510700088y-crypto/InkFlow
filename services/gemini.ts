import { GoogleGenAI } from "@google/genai";
import { CalligraphyStyle } from "../types";

const SYSTEM_INSTRUCTION = `You are a master Chinese calligrapher AI agent. 
Your task is to generate high-quality, authentic-looking Chinese calligraphy images.
The images should always be black ink on a pure white background.
Focus on the flow, stroke weight, and artistic balance of the characters.
Do not add any colored stamps, seals, or background textures. strictly black on white.`;

export const generateCalligraphy = async (name: string, style: CalligraphyStyle): Promise<string> => {
  // 1. 获取存储在本地的 API Key 和 代理地址
  const apiKey = localStorage.getItem('INKFLOW_API_KEY') || '';
  const baseUrl = localStorage.getItem('INKFLOW_BASE_URL') || '';

  if (!apiKey) {
    throw new Error("请先在设置中配置 API Key");
  }

  // 2. 初始化 Gemini 客户端，如果提供了代理地址(baseUrl)，则传入配置
  // 注意：@google/genai SDK 支持 baseUrl 选项
  const options: any = { apiKey: apiKey };
  if (baseUrl && baseUrl.trim().length > 0) {
    options.baseUrl = baseUrl;
  }
  
  const ai = new GoogleGenAI(options);

  const prompt = `
    Please create a calligraphy image for the name "${name}".
    Style: ${style}.
    
    Requirements:
    1. The text must be clearly written in rich, deep black Chinese ink.
    2. The background must be pure, flat white (RGB 255, 255, 255).
    3. The composition should be balanced and artistic, suitable for a signature.
    4. Ensure high contrast.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // 使用 Flash 模型速度更快，或者用 gemini-3-pro-image-preview
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // 注意：如果你使用 Imagen 模型生成图片，配置会不同。
        // 这里我们假设模型具备直接绘图能力，或返回绘图指令。
        // 为了稳定生成图片，建议使用专门的画图模型，但在纯文本环境下，
        // 我们通常请求模型生成 SVG 代码或描述。
        // *本案例为了配合 Prompt 假设我们在使用支持画图的多模态模型*
        // 如果您的代理支持 gemini-3-pro-image-preview，请使用该模型。
        // 如果只是普通文本模型，它无法直接返回图片二进制流。
        
        // **关键修正**：为了确保能跑通，如果您使用的是普通文本转发，
        // AI 无法直接返回二进制图片。但在本演示中，我们假设您连接的是支持 Image Generation 的端点。
        // 如果不行，我们退而求其次，请求 SVG 代码。
      }
    });

    // 尝试解析图片 (针对 gemini-3-pro-image-preview)
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    // 如果没有二进制图片，抛出错误 (实际生产中可以加入 SVG 生成的回退逻辑)
    throw new Error("AI 未返回图片数据，请确保使用了支持画图的模型 (如 gemini-3-pro-image-preview) 且代理支持二进制流转发。");

  } catch (error) {
    console.error("Gemini 生成错误:", error);
    throw error;
  }
};