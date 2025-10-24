# Dùng Node.js 20 bản Alpine (nhẹ, nhanh)
FROM node:20-alpine

# Tạo thư mục app
WORKDIR /usr/src/app

# Cài netcat để script có thể check MySQL
RUN apk add --no-cache netcat-openbsd

# Copy package.json và package-lock.json trước (nếu có)
COPY package*.json ./

# Cài dependencies (production)
RUN npm install --production

# Copy toàn bộ source code
COPY . .

# Copy script wait-and-run.sh
COPY wait-and-run.sh /wait-and-run.sh
RUN chmod +x /wait-and-run.sh

# Expose cổng API (theo server.js)
EXPOSE 3000

# Dùng script làm entrypoint thay vì npm start trực tiếp
ENTRYPOINT ["sh", "/wait-and-run.sh"]
