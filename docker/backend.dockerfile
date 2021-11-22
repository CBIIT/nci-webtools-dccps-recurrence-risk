FROM ${BACKEND_BASE_IMAGE:-quay.io/centos/centos:stream8}

RUN dnf -y update \
 && dnf -y install \
    dnf-plugins-core \
    epel-release \
    glibc-langpack-en \
 && dnf config-manager --set-enabled powertools \
 && dnf -y module enable nodejs:14 \
 && dnf -y install \
    nodejs \
    R \
 && dnf clean all

ENV R_REMOTES_NO_ERRORS_FROM_WARNINGS="true"

RUN Rscript -e "install.packages(c(\
    'jsonlite', \
    'remotes' \
), repos='https://cloud.r-project.org/')"

# ensure RecurRisk and dependencies are installed
RUN Rscript -e "remotes::install_github('cran/SEER2R', ref='1.0')"
RUN Rscript -e "remotes::install_github('cran/RecurRisk', ref='1.0.2')"

# install updated version of RecurRisk if applicable (do not remove previous RUN step, as that installs dependencies for RecurRisk)
ARG RECURRISK_R_PACKAGE_TAG=master
RUN Rscript -e "remotes::install_github('cran/RecurRisk', ref='$RECURRISK_R_PACKAGE_TAG', upgrade='never')"

RUN mkdir -p /app/server

WORKDIR /app/server

COPY server/package.json /app/server/

RUN npm install

COPY server /app/server/

CMD npm start
