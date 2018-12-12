FROM composer:1 as composer
COPY . /var/www/html
WORKDIR /var/www/html
ENV APP_ENV prod
RUN composer install --no-dev --no-scripts \
    && composer run auto-scripts \
    && php bin/console cache:warmup

FROM node:11 as yarn
COPY --from=composer /var/www/html /app
WORKDIR /app
RUN yarn install \
    && yarn run build \
    && rm -fr node_modules

FROM php:7.2-fpm-alpine
COPY --from=yarn /app /var/www/html
WORKDIR /var/www/html
ENV APP_ENV prod
RUN apk add supervisor

ENTRYPOINT ["supervisord", "--configuration", "/var/www/html/docker/supervisord.conf"]
