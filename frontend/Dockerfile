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

# Build the frontend (adjust if your build command is different)
RUN npm run build

# Expose the port the frontend will run on
EXPOSE 3000

# Command to run the frontend
CMD ["npm", "start"]
