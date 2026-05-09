FROM eclipse-temurin:17-jdk-jammy AS build

ARG SBT_VERSION=1.10.4

# install sbt
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl ca-certificates unzip \
 && curl -fsSL "https://github.com/sbt/sbt/releases/download/v${SBT_VERSION}/sbt-${SBT_VERSION}.tgz" \
    | tar -xz -C /opt \
 && ln -s /opt/sbt/bin/sbt /usr/local/bin/sbt \
 && rm -rf /var/lib/apt/lists/* # cleanup apt cache

WORKDIR /src

# Warm dependency cache before pulling app sources. This layer is reused unless build wiring changes.
COPY build.sbt ./
COPY project/ project/
RUN sbt -batch update

# app sources and configs
COPY app/ app/
COPY conf/ conf/

RUN sbt -batch dist \
 && unzip -q target/universal/backend-*.zip -d /opt/ \
 && mv /opt/backend-* /opt/backend

# --- runtime stage ---
FROM eclipse-temurin:17-jre-jammy AS runtime

# unprivliged user -> no running jvm as root
RUN useradd --system --uid 1000 --no-create-home --home-dir /opt/backend play

WORKDIR /opt/backend
COPY --from=build --chown=play:play /opt/backend/ ./

USER play
EXPOSE 9000

# Bind to all interfaces so Docker's port-forward reaches the JVM.
# pidfile to /dev/null: container restarts would otherwise trip "RUNNING_PID exists".
ENTRYPOINT ["bin/backend"]
CMD ["-Dhttp.port=9000", "-Dhttp.address=0.0.0.0", "-Dpidfile.path=/dev/null"]
