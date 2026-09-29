FROM mcr.microsoft.com/playwright:v1.47.0-jammy
WORKDIR /app
COPY package.json server.js ./
RUN npm install --omit=dev
ENV PORT=8080 MAX=3
EXPOSE 8080
CMD ["node", "server.js"]
