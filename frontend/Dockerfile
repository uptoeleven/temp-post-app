# Use an official Node.js LTS image for better cross-platform compatibility
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Clear NPM cache and install dependencies
RUN npm cache clean --force && npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the frontend (adjust if your build command is different)
RUN npm run build

# Expose the port the frontend will run on
EXPOSE 3000

# Command to run the frontend
CMD ["npm", "run", "dev"]