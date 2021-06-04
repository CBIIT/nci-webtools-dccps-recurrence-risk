# example build command (from repository root)
# docker build -t recurrence:backend -f docker/backend.dockerfile --build-args SPARRPOWR_TAG=CBIIT .
FROM centos:8.3.2011

RUN dnf -y update \
 && dnf -y install \
    dnf-plugins-core \
    epel-release \
    glibc-langpack-en \
 && dnf config-manager --set-enabled powertools \
 && dnf -y module enable nodejs:13 \
 && dnf -y install \
    nodejs \
    R \
    gdal-devel \
    geos \
    geos-devel \
    libcurl-devel \
    proj-devel \
    protobuf-devel \
    sqlite-devel \
    udunits2-devel \
    v8-devel \
    https://download.fedoraproject.org/pub/epel/7/x86_64/Packages/j/jq-1.6-2.el7.x86_64.rpm \
    https://download.fedoraproject.org/pub/epel/7/x86_64/Packages/j/jq-devel-1.6-2.el7.x86_64.rpm \
 && dnf clean all

ENV R_REMOTES_NO_ERRORS_FROM_WARNINGS="true"

# install sparrpowR dependencies
RUN Rscript -e "install.packages(c(\
    'SEER2R', \
    'jsonlite', \
    'flexsurvcure', \
    'data.table' \
), repos='https://cloud.r-project.org/')"

RUN mkdir /api

WORKDIR /api

COPY api/package*.json /api/

RUN npm install

COPY api /api/

CMD npm start