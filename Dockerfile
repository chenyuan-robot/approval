# build first
FROM harbor.cowarobot.cn/docker.io/node:20-alpine
WORKDIR /app
ENV NODE_ENV production
COPY ./unpackage/dist/build/web ./

ENV PORT 5173

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm install -g serve

EXPOSE 5173

CMD ["serve", "-s", ".", "-l", "5173"]