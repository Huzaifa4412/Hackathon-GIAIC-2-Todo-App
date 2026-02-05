# Dockerfile for Hugging Face Spaces deployment
# Optimized for FastAPI with OpenAI Agents SDK

FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Set environment variables for Hugging Face Spaces
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=7860 \
    HF_HOME=/app/.cache \
    TRANSFORMERS_CACHE=/app/.cache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create cache directory
RUN mkdir -p /app/.cache

# Expose port (Hugging Face Spaces uses port 7860)
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:7860/ || exit 1

# Run the application with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
