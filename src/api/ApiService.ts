import StorageOS from '@/src/storage/StorageOS';

const API_BASE_URL = 'http://192.168.0.109:3000/api'; // dev
// const API_BASE_URL = 'http://YOUR_SERVER_IP:3000/api'; // prod

class ApiService {
  static async makeRequest(endpoint: string, options = {}) {
    try {
      const token = await StorageOS.getItem("authToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };
      console.log(
        "[" + new Date().toISOString() + "] " + "Fetch Config:",
        config
      );
      console.log("Fetching from:", `${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Network error");
      }

      return data;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  static async login(username: string, password: string) {
    try {
      console.log("Login Payload:", { username, password });
      console.log("Logging in to:", `${API_BASE_URL}/auth/login`);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      console.log("Login Response Status:", response.status);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // ✅ Lưu token lại
      if (data.token) {
        await StorageOS.setItem("authToken", data.token);
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  static async getDocuments(
    category: string | undefined,
    subcategory: string | undefined,
    page = 1,
    limit = 20
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (category) params.append("category", category);
    if (subcategory) params.append("subcategory", subcategory);

    return this.makeRequest(`/documents?${params.toString()}`);
  }

  static async uploadDocument(formData: FormData) {
    // Extract category and subcategory from formData
    const categoryKey = formData.get("category") as string;
    const subcategoryKey = formData.get("subcategory") as string;
    const token = await StorageOS.getItem("authToken");
    const url = `${API_BASE_URL}/documents/upload?category=${encodeURIComponent(
      categoryKey || "general"
    )}&subcategory=${encodeURIComponent(subcategoryKey || "general")}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData, let the browser set it
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Upload failed");
    }

    return data;
  }

  static async downloadDocument(documentId: any) {
    const token = await StorageOS.getItem("authToken");

    const response = await fetch(
      `${API_BASE_URL}/documents/${documentId}/download`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Download failed");
    }

    return response;
  }

  // Add new method for getting download URL
  static async getDownloadUrl(documentId: any) {
    const token = await StorageOS.getItem("authToken");
    return `${API_BASE_URL}/documents/${documentId}/download?token=${token}`;
  }

  static async searchDocuments(
    query: string,
    category: string | undefined,
    subcategory: string | undefined
  ) {
    const params = new URLSearchParams({ query });
    if (category) params.append("category", category);
    if (subcategory) params.append("subcategory", subcategory);

    return this.makeRequest(`/documents/search?${params.toString()}`);
  }
}

export default ApiService;
