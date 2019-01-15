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
    APP_SECRET='73adb4285b84053d174db4b65ffa8ff4bfa24e1b' \
    PUBLIC_WEBSOCKET_URL='ws://localhost:8080' \
    WAMP_REALM=realm1 \
    WAMP_PASSWORD=pleaseChooseASecretPasswordForTheWebsocket \
    WAMP_INTERNAL_HOSTNAME=board \
    BOARD_LOGIN_PASSWORD='phash-board'

RUN apk add supervisor \
    && php bin/console cache:warmup

EXPOSE 8080 8081
ENTRYPOINT ["supervisord", "--configuration", "/var/www/html/docker/supervisord.conf"]
