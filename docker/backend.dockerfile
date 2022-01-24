FROM ${BACKEND_BASE_IMAGE:-quay.io/centos/centos:stream8}

RUN dnf -y update \
 && dnf -y install \
    dnf-plugins-core \
    epel-release \
    glibc-langpack-en \
 && dnf config-manager --set-enabled powertools \
 && dnf -y module enable nodejs:16 \
 && dnf -y install \
    nodejs \
    R \
 && dnf clean all

RUN mkdir -p /app/server

WORKDIR /app/server

RUN Rscript -e "install.packages('renv', repos = 'https://cloud.r-project.org/')"

COPY server/renv.lock /app/server/

RUN Rscript -e "renv::restore()"

COPY server/package.json /app/server/

RUN npm install

COPY server /app/server/

CMD npm start
