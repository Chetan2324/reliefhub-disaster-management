#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing PHP dependencies..."
composer install --no-interaction --prefer-dist --optimize-autoloader

echo "Setting up environment..."
cp .env.example .env
php artisan key:generate

echo "Configuring Database..."
# For a free Render deployment, we will use an SQLite database (ephemeral, resets on reboot, perfect for a fast demo)
touch database/database.sqlite
sed -i 's/DB_CONNECTION=mysql/DB_CONNECTION=sqlite/' .env
sed -i 's/DB_DATABASE=laravel/DB_DATABASE='$(pwd)'\/database\/database.sqlite/' .env

echo "Running migrations and seeding demo data..."
php artisan migrate:fresh --seed --force

echo "Clearing cache..."
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
