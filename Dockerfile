FROM oven/bun:slim

COPY package.json ./

RUN bun install

COPY . .

CMD ["bun", "run", "start"]
