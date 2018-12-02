FROM php:7.2-fpm-alpine
RUN apk add autoconf \
      zlib \
      zlib-dev \
      supervisor \
      yarn \
   && docker-php-ext-install zip \
   && docker-php-ext-enable zip \
   && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/bin --filename=composer

COPY . /var/www/html
RUN cd /var/www/html \
    && composer install \
    && php bin/console cache:warmup \
    && yarn install \
    && yarn build

RUN mkdir -p /var/log/supervisord

COPY ./Docker/supervisord.conf /etc/supervisord.conf

ENTRYPOINT ["supervisord", "--nodaemon", "--configuration", "/etc/supervisord.conf"]