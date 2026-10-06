FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js index.html ./
ENV NODE_ENV=production DATA_DIR=/data
RUN mkdir /data && chown node:node /data
VOLUME /data
USER node
EXPOSE 3000
CMD ["node", "server.js"]
