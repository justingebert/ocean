FROM sbtscala/scala-sbt:eclipse-temurin-17.0.15_6_1.12.11_2.13.18 AS build

WORKDIR /src

# Warm dependency cache
COPY build.sbt ./
COPY project/ project/
RUN sbt -batch update

COPY app/ app/
COPY conf/ conf/

RUN sbt -batch stage

FROM eclipse-temurin:17-jre-jammy AS runtime

# add dfn root ca to nvm truststore
# decided against USE_SYSTEM_CA_CERTS since this needs to run entrypoint with root
COPY docker/dfn-community-root-ca-2022.pem /tmp/dfn-root-ca.pem
RUN keytool -importcert -noprompt -trustcacerts \
      -alias dfn-community-root-ca-2022 \
      -file /tmp/dfn-root-ca.pem \
      -keystore "$JAVA_HOME/lib/security/cacerts" -storepass changeit \
 && rm /tmp/dfn-root-ca.pem

# unprivliged user -> no running jvm as root
RUN useradd --system --uid 1000 --no-create-home --home-dir /opt/backend play

WORKDIR /opt/backend
COPY --from=build --chown=play:play /src/target/universal/stage/ ./

USER play
EXPOSE 9000

# Bind to all interfaces so Docker's port-forward reaches the JVM.
# pidfile to /dev/null: container restarts would otherwise trip "RUNNING_PID exists".
ENTRYPOINT ["bin/backend"]
CMD ["-Dhttp.port=9000", "-Dhttp.address=0.0.0.0", "-Dpidfile.path=/dev/null"]
