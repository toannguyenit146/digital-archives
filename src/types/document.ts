// src/types/document.ts
export interface Document {
    id: string;
    title: string;
    filename: string;
    author: string;
    category: string;
    subcategory?: string;
    uploadedAt: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  }