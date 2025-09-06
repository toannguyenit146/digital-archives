import ApiService from "../api/ApiService";
import { CategoryItem, SubcategoryItem } from "../types";

let categories: CategoryItem[] = [];
let documentSubcategories: SubcategoryItem[] = [];

async function loadCategoriesFromDB() {
  ApiService.getCategories().then((data) => {
    // console.log("Loaded categories from DB:", data);
    if (data.success && data.categories) {
      categories.push(...(data.categories as CategoryItem[]));
    } else {
      categories = [
        {
          id: "8592f553-896d-11f0-9914-ce3dc8f2a4bb",
          title: "Tài liệu",
          color: "#4A90E2",
          icon: "document-text",
          description: "Quản lý và truy cập tài liệu",
          hasSubcategories: true,
          allowUpload: true,
          keyName: "tailieu",
        },
        {
          id: "85940a4a-896d-11f0-9914-ce3dc8f2a4bb",
          title: "Kiến thức thường trực",
          color: "#7ED321",
          icon: "school",
          description: "Kiến thức cần thiết thường xuyên",
          hasSubcategories: false,
          allowUpload: true,
          keyName: "kienthucthuongtruc",
        },
        {
          id: "85951014-896d-11f0-9914-ce3dc8f2a4bb",
          title: "Đối tượng SQ, QNCN",
          color: "#F5A623",
          icon: "people",
          description: "Thông tin sĩ quan, quân nhân chuyên nghiệp",
          hasSubcategories: false,
          allowUpload: true,
          keyName: "doituongsqvaqncn",
        },
        {
          id: "85962f60-896d-11f0-9914-ce3dc8f2a4bb",
          title: "Đối tượng HLTPĐ",
          color: "#FF6B6B",
          icon: "training",
          description: "HSQ, BS thay phiên đảo",
          hasSubcategories: false,
          allowUpload: true,
          keyName: "doituonghltpd",
        },
        {
          id: "8597540c-896d-11f0-9914-ce3dc8f2a4bb",
          title: "Đối tượng HSQ, BS",
          color: "#D0021B",
          icon: "shield",
          description: "Hạ sĩ quan và binh sĩ",
          hasSubcategories: false,
          allowUpload: true,
          keyName: "hasiquanvabinhsi",
        },
        {
          id: "85986cc0-896d-11f0-9914-ce3dc8f2a4bb",
          title: "ĐTĐ, ĐVM",
          color: "#9013FE",
          icon: "party",
          description: "Đảng viên và đảng viên mới",
          hasSubcategories: false,
          allowUpload: true,
          keyName: "dangvienvadangvienmoi",
        },
        {
          id: "8599791d-896d-11f0-9914-ce3dc8f2a4bb",
          title: "Đối tượng Đoàn viên",
          color: "#50E3C2",
          icon: "ribbon",
          description: "Thông tin về đoàn viên",
          hasSubcategories: false,
          allowUpload: true,
          keyName: "doituongdoanvien",
        },
        {
          id: "859a8eb8-896d-11f0-9914-ce3dc8f2a4bb",
          title: "Cấu hỏi kiến thức GDCT",
          color: "#B8E986",
          icon: "help-circle",
          description: "Câu hỏi giáo dục chính trị",
          hasSubcategories: false,
          allowUpload: true,
          keyName: "cauhoikienthucgdct",
        },
        {
          id: "859b882d-896d-11f0-9914-ce3dc8f2a4bb",
          title: "Cấu hỏi kiến thức pháp luật",
          color: "#4BD5EA",
          icon: "library",
          description: "Câu hỏi về pháp luật",
          hasSubcategories: false,
          allowUpload: true,
          keyName: "cauhoikienthucphapluat",
        },
      ];
    }
  });
}

async function loadSubcategoriesOfDocumentFromDB() {
  ApiService.getSubcategoriesOfDocument().then((data) => {
    // console.log("Loaded subcategories of document from DB:", data);
    if (data.success && data.subcategories) {
      documentSubcategories.push(...(data.subcategories as SubcategoryItem[]));
    } else {
      documentSubcategories = [
        {
          id: "4d4089d3-89f3-11f0-972c-7e5dac7767b9",
          title: "Lịch sử",
          icon: "history",
          description: "Tài liệu lịch sử",
          parentId: "8592f553-896d-11f0-9914-ce3dc8f2a4bb",
          keyName: "lichsu",
        },
        {
          id: "4d426089-89f3-11f0-972c-7e5dac7767b9",
          title: "Nghị quyết",
          icon: "resolution",
          description: "Nghị quyết và quyết định",
          parentId: "8592f553-896d-11f0-9914-ce3dc8f2a4bb",
          keyName: "nghiquyet",
        },
        {
          id: "4d49e7a9-89f3-11f0-972c-7e5dac7767b9",
          title: "Khoa học",
          icon: "science",
          description: "Tài liệu khoa học kỹ thuật",
          parentId: "8592f553-896d-11f0-9914-ce3dc8f2a4bb",
          keyName: "khoahoc",
        },
        {
          id: "4d4b2bdd-89f3-11f0-972c-7e5dac7767b9",
          title: "Kinh tế - Xã hội",
          icon: "economics",
          description: "Tài liệu kinh tế xã hội",
          parentId: "8592f553-896d-11f0-9914-ce3dc8f2a4bb",
          keyName: "kt-xh",
        },
        {
          id: "4d48e732-89f3-11f0-972c-7e5dac7767b9",
          title: "Quân sự - Quốc phòng",
          icon: "qs-qp",
          description: "Quân sự - Quốc phòng",
          parentId: "8592f553-896d-11f0-9914-ce3dc8f2a4bb",
          keyName: "quansuvaquocphong",
        },
        {
          id: "4d4c581b-89f3-11f0-972c-7e5dac7767b9",
          title: "Văn hóa",
          icon: "culture",
          description: "Tài liệu văn hóa",
          parentId: "8592f553-896d-11f0-9914-ce3dc8f2a4bb",
          keyName: "vanhoa",
        },
        {
          id: "4d4430e6-89f3-11f0-972c-7e5dac7767b9",
          title: "Pháp luật",
          icon: "law",
          description: "Văn bản pháp luật",
          parentId: "8592f553-896d-11f0-9914-ce3dc8f2a4bb",
          keyName: "phapluat",
        },
        {
          id: "4d4630a0-89f3-11f0-972c-7e5dac7767b9",
          title: "Nghị định",
          icon: "decree",
          description: "Nghị định của Chính phủ",
          parentId: "8592f553-896d-11f0-9914-ce3dc8f2a4bb",
          keyName: "nghidinh",
        },
        {
          id: "4d47ed00-89f3-11f0-972c-7e5dac7767b9",
          title: "Thông tư",
          icon: "circular",
          description: "Thông tư hướng dẫn",
          parentId: "8592f553-896d-11f0-9914-ce3dc8f2a4bb",
          keyName: "thongtu",
        },
        {
          id: "4d4db373-89f3-11f0-972c-7e5dac7767b9",
          title: "Hình ảnh",
          icon: "image",
          description: "Tài liệu hình ảnh",
          parentId: "8592f553-896d-11f0-9914-ce3dc8f2a4bb",
          keyName: "hinhanh",
        },
        {
          id: "4d4eacf4-89f3-11f0-972c-7e5dac7767b9",
          title: "Video",
          icon: "video",
          description: "Tài liệu video",
          parentId: "8592f553-896d-11f0-9914-ce3dc8f2a4bb",
          keyName: "video",
        },
      ];
    }
  });
}

loadCategoriesFromDB();
loadSubcategoriesOfDocumentFromDB();
export { categories, documentSubcategories };

