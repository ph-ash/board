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

FROM alpine:3.9
ARG CURRENT_VERSION=master
COPY --from=yarn /app /var/www/html
WORKDIR /var/www/html
ENV APP_ENV=prod \
    APP_SECRET='73adb4285b84053d174db4b65ffa8ff4bfa24e1b' \
    PUBLIC_WEBSOCKET_URL='ws://localhost/websocket' \
    WAMP_REALM=realm1 \
    WAMP_PASSWORD=pleaseChooseASecretPasswordForTheWebsocket \
    WAMP_INTERNAL_HOSTNAME=board \
    BOARD_LOGIN_PASSWORD='phash-board'

RUN apk add --no-cache php7-fpm \
       php7-cli \
       php7-ctype \
       php7-dom \
       php7-json \
       php7-mbstring \
       php7-openssl \
       php7-session \
       php7-tokenizer \
       supervisor \
    && cp docker/*-fpm.conf /etc/php7/php-fpm.d/ \
    && echo -e "parameters:\n    version: $CURRENT_VERSION\n" > /var/www/html/config/packages/parameters.yaml \
    && php bin/console cache:clear \
    && echo "successfully built $CURRENT_VERSION"

EXPOSE 8080 8081 9000
ENTRYPOINT ["supervisord", "--configuration", "/var/www/html/docker/supervisord.conf"]
