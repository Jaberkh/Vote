# استفاده از تصویر پایه Node.js
FROM node:20

# ایجاد دایرکتوری برای برنامه
WORKDIR /usr/src/app

# کپی package.json و package-lock.json
COPY package*.json ./

# نصب وابستگی‌ها
RUN npm install

# کپی باقی‌مانده‌ی کد
COPY . .

# قرار دادن پورت
EXPOSE 3000

# اجرای برنامه
CMD ["npm", "run", "serve"]
