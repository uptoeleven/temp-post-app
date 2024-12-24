# Use a Windows-compatible Node.js base image
FROM mcr.microsoft.com/windows/servercore:ltsc2022 AS base

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose the application port
EXPOSE 5000

# Define the command to run the application
CMD ["node", "server.js"]
