# Only the node modules are created here
FROM node:16-alpine as dependenciesStage
WORKDIR /app
COPY package.json ./
RUN yarn install --frozen-lockfile

# Node modules are copied from the previous stage, and the app is built
FROM node:16-alpine as builderStage
WORKDIR /app
COPY --from=dependenciesStage /app/node_modules ./node_modules
COPY . .
#ARG NODE_ENV=development
#RUN echo ${NODE_ENV}
ENV NEXT_TELEMETRY_DISABLED 1
#RUN NODE_ENV=${NODE_ENV} yarn
#RUN NODE_ENV=${NODE_ENV} yarn build
RUN yarn
RUN yarn add node-fetch@2
RUN yarn build

# Only the required files from the build stage are copied to the final stage
FROM node:16-alpine as finalStage
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV DOMAIN_URL 'NA'
ENV API_URL = http://server1:3001

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

RUN echo ls
COPY --from=builderStage /app/public ./public
COPY --from=builderStage --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builderStage --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
CMD ["node", "server.js"]
