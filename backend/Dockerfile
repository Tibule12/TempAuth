# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
# gcc and libpq-dev are often needed for compiling Python packages (like psycopg2 for Postgres)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . .

# Make port 8000 available to the world outside this container
# Although Render sets the PORT env var, documenting 8000 is good practice.
EXPOSE 8000

# Run uvicorn when the container launches
# using shell form to expand the $PORT variable provided by Render
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"
