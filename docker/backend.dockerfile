FROM ${BASE_IMAGE:-public.ecr.aws/amazonlinux/amazonlinux:2}

RUN yum -y update \
 && curl -fsSL https://rpm.nodesource.com/setup_16.x | bash - \
 && amazon-linux-extras enable R4 \
 && yum clean metadata \
 && yum -y install \
    java-17-amazon-corretto \
    java-17-amazon-corretto-devel \
    nodejs \ 
    R \
 && yum clean all

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
