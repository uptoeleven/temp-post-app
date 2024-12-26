# Use an official Node.js LTS image for better cross-platform compatibility
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the application
COPY . .

# Expose the application port
EXPOSE 3001

# Define the command to run the application
CMD ["node", "server.js"]
