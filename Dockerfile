FROM node:18-slim

WORKDIR /app

# Install dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Create directories for persistent data
RUN mkdir -p qr_codes logs .wwebjs_auth/session

# Set permissions for directories
RUN chmod -R 777 qr_codes logs .wwebjs_auth

# Set environment variables
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=512"

# Expose port if needed (for web interface or API)
# EXPOSE 8080

# Command to run the application
CMD ["npm", "start"]