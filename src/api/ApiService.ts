import StorageOS from "../../src/storage/StorageOS";
const API_BASE_URL = "http://192.168.0.109:3000/api"; // dev
// const API_BASE_URL = 'http://YOUR_SERVER_IP:3000/api'; // prod

class ApiService {
  static async makeRequest(endpoint: string, options = {}) {
    try {
      const token = await StorageOS.getItem("authToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options,
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

  static async makePublicRequest(endpoint: string, options = {}) {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          ...options,
        },
        ...options,
      };
      console.log(
        "[" + new Date().toISOString() + "] " + "Public Fetch Config:",
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
      console.error("Public API Request Error:", error);
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

  // FILE SYSTEM API METHODS
  // Get Main Categories
  static async getCategories() {
    return this.makePublicRequest("/file-system/main-categories");
  }

  // Get subcategories of Tai lieu
  static async getSubcategoriesOfDocument() {
    return this.makePublicRequest("/file-system/sub-categories-document");
  }
  // Get folder contents (files and subfolders)
  static async getFolderContents(folderId: string | null, category?: string) {
    const params = new URLSearchParams();
    if (folderId) params.append("parent_id", folderId);
    // if (category) params.append("category", category);

    return this.makeRequest(`/file-system/contents?${params.toString()}`);
  }

  // Create new folder
  static async createFolder(
    name: string,
    parentId: string | null,
    category?: string
  ) {
    return this.makeRequest("/file-system/folder", {
      method: "POST",
      body: JSON.stringify({
        name,
        parent_id: parentId,
        category,
      }),
    });
  }

  // Rename file or folder
  static async renameItem(itemId: string, newName: string) {
    return this.makeRequest(`/file-system/${itemId}/rename`, {
      method: "PATCH",
      body: JSON.stringify({ name: newName }),
    });
  }

  // Move file or folder
  static async moveItem(itemId: string, newParentId: string | null) {
    return this.makeRequest(`/file-system/${itemId}/move`, {
      method: "PATCH",
      body: JSON.stringify({ parent_id: newParentId }),
    });
  }

  // Delete file or folder
  static async deleteItem(itemId: string) {
    return this.makeRequest(`/file-system/${itemId}`, {
      method: "DELETE",
    });
  }

  // Get breadcrumb path
  static async getBreadcrumb(folderId: string | null) {
    if (!folderId) return { success: true, breadcrumb: [] };
    return this.makeRequest(`/file-system/breadcrumb?folder_id=${folderId}`);
  }

  // Upload file to specific folder
  static async uploadFileToFolder(formData: FormData, folderId?: string | null) {
    const token = await StorageOS.getItem("authToken");
    const params = new URLSearchParams();
    if (folderId) params.append("parent_id", folderId);

    const url = `${API_BASE_URL}/file-system/upload?${params.toString()}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Upload failed");
    }
    return data;
  }

  // Search files
  static async searchFiles(query: string, category?: string) {
    const params = new URLSearchParams({ query });
    if (category) params.append("category", category);

    return this.makeRequest(`/file-system/search?${params.toString()}`);
  }

  // Download file
  static async downloadFile(fileId: string) {
    const token = await StorageOS.getItem("authToken");

    const response = await fetch(
      `${API_BASE_URL}/file-system/${fileId}/download`,
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

  // Get download URL
  static async getDownloadUrl(fileId: string) {
    const token = await StorageOS.getItem("authToken");
    return `${API_BASE_URL}/file-system/${fileId}/download?token=${token}`;
  }
}

export default ApiService;