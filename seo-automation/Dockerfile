# Muslim Google SEO Automation Container
# Continuous SEO page generation for high rankings
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    wget \
    bash \
    dcron \
    tzdata

# Set timezone
ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --omit=dev

# Copy SEO automation system
COPY . .

# Create directories for generated content
RUN mkdir -p /app/generated-pages \
    /app/logs \
    /app/backups \
    /app/sitemaps \
    /app/monitoring

# Set permissions
RUN if [ -d /app/scripts ]; then chmod +x /app/scripts/*.sh; fi

# Create non-root user for security
RUN addgroup -g 1001 -S seo && \
    adduser -S seo -u 1001 -G seo

# Change ownership of app directory
RUN chown -R seo:seo /app

# Switch to non-root user
USER seo

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Expose port for monitoring
EXPOSE 3000

# Default command
CMD ["node", "seo-automation-server.js"]
