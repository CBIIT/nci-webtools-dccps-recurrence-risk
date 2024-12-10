FROM public.ecr.aws/amazonlinux/amazonlinux:2023

RUN dnf -y update \
 && dnf -y install \
    gcc-c++ \
    make \
    nodejs \
    npm \
    R-4.1.3 \
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
