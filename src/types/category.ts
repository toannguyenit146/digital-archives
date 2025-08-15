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