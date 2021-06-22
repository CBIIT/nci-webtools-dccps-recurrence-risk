# Stage 1 - Copy static assets
FROM centos:8.3.2011

RUN dnf -y update \
 && dnf -y install \
    dnf-plugins-core \
    epel-release \
    glibc-langpack-en \
 && dnf -y module enable nodejs:14 \
 && dnf -y install \
    gcc-c++ \
    httpd \
    make \
    nodejs \
 && dnf clean all

 # Add custom httpd configuration
COPY docker/recurrence.conf /etc/httpd/conf.d/recurrence.conf

RUN mkdir /ui

WORKDIR /ui

COPY ui/package*.json /ui/

RUN npm install

COPY ui /ui/

RUN npm run-script build \
 && mv dist /var/www/html/recurrence \
 && chown -R apache:apache /var/www/html

WORKDIR /var/www/html/recurrence

EXPOSE 80
EXPOSE 443

CMD rm -rf /run/httpd/* /tmp/httpd* \
 && exec /usr/sbin/apachectl -DFOREGROUND