FROM postgres:14-alpine

ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=admin
ENV POSTGRES_DB=todos

COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 5432
