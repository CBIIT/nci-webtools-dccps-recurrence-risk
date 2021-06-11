# example build command (from repository root)
# docker build -t recurrence:backend -f docker/backend.dockerfile --build-args SPARRPOWR_TAG=CBIIT .
FROM centos:8.3.2011

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
    libcurl-devel \
 && dnf clean all

ENV R_REMOTES_NO_ERRORS_FROM_WARNINGS="true"

# install sparrpowR dependencies
RUN Rscript -e "install.packages(c(\
    'remotes', \
    'jsonlite', \
    'flexsurvcure', \
    'data.table' \
), repos='https://cloud.r-project.org/'); \
   remotes::install_github('cran/SEER2R')"

RUN mkdir /api

WORKDIR /api

COPY api/package*.json /api/

RUN npm install

COPY api /api/

CMD npm start