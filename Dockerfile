# Используем официальный образ Node.js 16
FROM node:16

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json (если есть) для установки зависимостей
COPY package*.json .

# Устанавливаем зависимости
RUN npm install

# Копируем все остальные файлы из текущей директории внутрь контейнера
COPY . .

# Открываем порт, если ваше приложение слушает на каком-то конкретном порту
EXPOSE 3000

# Команда для запуска вашего приложения
CMD ["node", "run", "start"]