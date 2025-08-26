const fs = require("fs");
const path = require("path");

const targetProps = ["shadowColor", "shadowOffset", "shadowOpacity", "shadowRadius", "pointerEvents"];

// duyệt toàn bộ thư mục
function scanDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      scanDir(filePath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      checkFile(filePath);
    }
  });
}

// check từng file
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  targetProps.forEach((prop) => {
    if (content.includes(prop)) {
      console.log(`⚠️ Found "${prop}" in ${filePath}`);
    }
  });
}

// chạy
scanDir(path.join(__dirname, "app")); // đổi "app" nếu source code ở thư mục khác
console.log("✅ Scan finished!");
