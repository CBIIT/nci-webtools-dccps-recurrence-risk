FROM quay.io/centos/centos:stream9

RUN dnf -y update \
 && dnf -y install \
    dnf-plugins-core \
    epel-release \
 && dnf config-manager --set-enabled crb \
 && curl -fsSL https://rpm.nodesource.com/setup_18.x | bash - \
 && dnf -y install \
    gcc-c++ \
    make \
    nodejs \
    python3-devel \
    R \
 && dnf clean all

RUN R CMD javareconf

RUN mkdir -p /app/server

WORKDIR /app/server

RUN Rscript -e "install.packages('renv', repos = 'https://cloud.r-project.org/')"

COPY server/renv.lock /app/server/

RUN Rscript -e "renv::restore()"

COPY server/package.json /app/server/

RUN npm install

COPY server /app/server/

CMD npm start
