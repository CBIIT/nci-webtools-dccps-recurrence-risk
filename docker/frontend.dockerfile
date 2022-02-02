FROM ${BASE_IMAGE:-public.ecr.aws/amazonlinux/amazonlinux:2}

RUN yum -y update \
 && curl -fsSL https://rpm.nodesource.com/setup_16.x | bash - \
 && amazon-linux-extras enable httpd_modules \
 && yum clean metadata \
 && yum -y install \
    httpd \
    nodejs \
 && yum clean all

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
 && exec /usr/sbin/apachectl -DFOREGROUND