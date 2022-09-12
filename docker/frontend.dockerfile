FROM public.ecr.aws/amazonlinux/amazonlinux:2022

RUN dnf -y update \
 && dnf -y install \
    gcc-c++ \
    httpd \
    make \
    nodejs \
    npm \
 && dnf clean all

RUN mkdir -p /app/client

WORKDIR /app/client

COPY client/package.json /app/client/

RUN npm install

COPY client /app/client/

RUN npm run build \
 && mv /app/client/dist/recurrence-risk-client /var/www/html/recurrence

COPY docker/frontend.conf /etc/httpd/conf.d/frontend.conf

WORKDIR /var/www/html

EXPOSE 80
EXPOSE 443

CMD rm -rf /run/httpd/* /tmp/httpd* \
 && exec /usr/sbin/httpd -DFOREGROUND