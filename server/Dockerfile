FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY src ./src
COPY .env.example ./
EXPOSE 5000
CMD ["npm", "start"]
