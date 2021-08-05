FROM node:14

# Install global files
RUN ["yarn", "global", "add",  "knex"]
RUN ["yarn", "global", "add",  "typescript"]

# Set environment
ENV NODE_ENV development
ENV PORT 8000

# Create app directory.
WORKDIR /app

# Build dependencies.
COPY ["package.json", "./"]

RUN yarn install

COPY . .

# Expose the port
EXPOSE 8000

CMD ["bash", "./scripts/init-server-dev.sh"]