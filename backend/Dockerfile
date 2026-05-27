FROM php:8.2-cli

# Install system dependencies for Laravel & SQLite
RUN apt-get update -y && apt-get install -y \
    unzip \
    sqlite3 \
    libsqlite3-dev \
    git \
    curl \
    libonig-dev \
    libxml2-dev

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql pdo_sqlite mbstring exif pcntl bcmath xml

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy existing application directory contents
COPY . /app

# Setup SQLite Database
RUN touch database/database.sqlite

# Install dependencies
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Setup environment
RUN cp .env.example .env
RUN php artisan key:generate

# Configure to use SQLite
RUN sed -i 's/DB_CONNECTION=mysql/DB_CONNECTION=sqlite/' .env
RUN sed -i 's/DB_DATABASE=laravel/DB_DATABASE=\/app\/database\/database.sqlite/' .env

# Run migrations and seed
RUN php artisan migrate:fresh --seed --force

# Expose port (Render injects $PORT automatically)
EXPOSE 8000

# Start artisan server
CMD php artisan serve --host=0.0.0.0 --port=$PORT
