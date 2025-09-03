// Interfaces
export interface CategoryItem {
  id: string;
  title: string;
  color: string;
  icon: string;
  description: string;
  hasSubcategories?: boolean;
  allowUpload?: boolean;
  keyName: string;
}

export interface SubcategoryItem {
  id: string;
  title: string;
  icon: string;
  description: string;
  parentId: string;
  keyName: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role?: string;
}

export interface Document {
  id: string;
  title: string;
  filename: string;
  author: string;
  category: string;
  subcategory?: string;
  created_at: string;
  file_url: string;
  file_size: number;
  file_type: string;
  uploader_name?: string;
}