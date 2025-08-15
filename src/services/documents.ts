// src/services/documents.ts
import { supabase } from './auth';
import { Document } from '../types/document';

export const documentService = {
  async loadDocuments(categoryId: string, subcategoryId?: string): Promise<Document[]> {
    try {
      let query = supabase
        .from('documents')
        .select(`
          id,
          title,
          filename,
          author,
          category,
          subcategory,
          created_at,
          file_url,
          file_size,
          file_type
        `)
        .eq('category', categoryId);

      if (subcategoryId) {
        query = query.eq('subcategory', subcategoryId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedDocuments: Document[] = (data || []).map(doc => ({
        id: doc.id,
        title: doc.title,
        filename: doc.filename,
        author: doc.author,
        category: doc.category,
        subcategory: doc.subcategory,
        uploadedAt: doc.created_at,
        fileUrl: doc.file_url,
        fileSize: doc.file_size,
        fileType: doc.file_type,
      }));

      return formattedDocuments;
    } catch (error) {
      console.error('Error loading documents:', error);
      return [];
    }
  },

  async uploadDocument(documentData: {
    title: string;
    filename: string;
    author: string;
    category: string;
    subcategory?: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  }): Promise<void> {
    const { error } = await supabase.from('documents').insert({
      title: documentData.title,
      filename: documentData.filename,
      author: documentData.author,
      category: documentData.category,
      subcategory: documentData.subcategory || null,
      file_url: documentData.fileUrl,
      file_size: documentData.fileSize,
      file_type: documentData.fileType,
    });

    if (error) throw error;
  },
};
