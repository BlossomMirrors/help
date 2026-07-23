FROM denoland/deno:latest AS builder
WORKDIR /app
COPY package.json deno.json deno.lock ./
RUN deno install --frozen
COPY . .
RUN deno task build

FROM denoland/deno:latest AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.deno-deploy ./.deno-deploy
COPY package.json deno.json deno.lock ./
ENV NODE_ENV=production
EXPOSE 8000
CMD ["deno", "run", "-A", "./.deno-deploy/server.ts"]
