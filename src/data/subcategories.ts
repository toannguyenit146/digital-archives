// src/data/subcategories.ts
import { SubcategoryItem } from '../types/category';

export const documentSubcategories: SubcategoryItem[] = [
  { id: '1-1', title: 'Lịch sử', icon: 'history', description: 'Tài liệu lịch sử', parentId: '1', keyName: 'lichsu'},
  { id: '1-2', title: 'Nghị quyết', icon: 'resolution', description: 'Nghị quyết và quyết định', parentId: '1', keyName: 'nghiquyet'},
  { id: '1-3', title: 'Khoa học', icon: 'science', description: 'Tài liệu khoa học kỹ thuật', parentId: '1', keyName: 'khoahoc' },
  { id: '1-4', title: 'Kinh tế - Xã hội', icon: 'economics', description: 'Tài liệu kinh tế xã hội', parentId: '1', keyName: 'kt-xh' },
  { id: '1-5', title: 'Quân sự - Quốc phòng', icon: 'qs-qp', description: 'Quân sự - Quốc phòng', parentId: '1', keyName: 'quansuvaquocphong' },
  { id: '1-6', title: 'Văn hóa', icon: 'culture', description: 'Tài liệu văn hóa', parentId: '1', keyName: 'vanhoa' },
  { id: '1-7', title: 'Pháp luật', icon: 'law', description: 'Văn bản pháp luật', parentId: '1', keyName: 'phapluat' },
  { id: '1-8', title: 'Nghị định', icon: 'decree', description: 'Nghị định của Chính phủ', parentId: '1', keyName: 'nghidinh' },
  { id: '1-9', title: 'Thông tư', icon: 'circular', description: 'Thông tư hướng dẫn', parentId: '1', keyName: 'thongtu' },
  { id: '1-10', title: 'Hình ảnh', icon: 'image', description: 'Tài liệu hình ảnh', parentId: '1', keyName: 'hinhanh' },
  { id: '1-11', title: 'Video', icon: 'video', description: 'Tài liệu video', parentId: '1', keyName: 'video' },
];
