import { API_BASE_URL } from "./api";

export async function uploadBase64Image(base64: string, category: string, token?: string): Promise<string> {
  if (!base64 || !base64.startsWith("data:image/")) {
    return base64; // Return as is if it's already a URL or empty
  }

  const endpoint = `${API_BASE_URL}/upload/image`;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        imageBase64: base64,
        category,
      }),
    });

    const data = await res.json();
    if (data.success && data.data?.url) {
      // If the backend returned a real URL, return it
      return data.data.url;
    }
    
    console.error("Failed to upload base64 image:", data.error);
    return "";
  } catch (err) {
    console.error("Network error uploading base64 image:", err);
    return "";
  }
}

