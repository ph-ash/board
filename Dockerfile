FROM composer:1 as composer
COPY . /var/www/html
WORKDIR /var/www/html
ENV APP_ENV=prod

RUN composer install --no-dev --no-scripts --optimize-autoloader \
    && composer run auto-scripts

# next stage #

FROM node:11 as yarn
COPY --from=composer /var/www/html /app
WORKDIR /app
RUN yarn install \
    && yarn run build \
    && rm -fr node_modules

# next stage #

FROM php:7.2-fpm-alpine
COPY --from=yarn /app /var/www/html
WORKDIR /var/www/html
ENV APP_ENV=prod \
    PUBLIC_HOSTNAME=localhost \
    WEBSOCKET_REALM=realm1 \
    WEBSOCKET_PASSWORD=pleaseChooseASecretPasswordForTheWebsocket \
    USER_PASSWORD='$argon2i$v=19$m=1024,t=2,p=2$TUVUYWk3SVpMekVTOWJaaQ$/X8MSzzLEHJHfBllXjbw25sBA5pj7xHDhojjHwoqOmQ'

RUN apk add supervisor \
    && php bin/console cache:warmup

EXPOSE 8080 8081
ENTRYPOINT ["supervisord", "--configuration", "/var/www/html/docker/supervisord.conf"]
