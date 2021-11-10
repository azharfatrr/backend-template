FROM node:14

# Install global files
RUN ["npm", "install", "-g",  "knex"]
# RUN ["npm", "install", "-g",  "typescript"]
# RUN ["npm", "install", "-g",  "pm2"]

# Create app directory.
WORKDIR /app

# Build dependencies.
COPY ["package.json", "./"]

# Install dependencies.
RUN npm install

COPY . .

# Expose the port
EXPOSE 8000

CMD ["bash", "./scripts/init_server_dev.sh"]