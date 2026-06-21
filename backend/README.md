# Ocean backend

The REST API behind the UI, the "managing" app. It authenticates users against
HTW LDAP, tracks who owns what in its own internal Postgres, and runs the actual
`CREATE DATABASE` / `CREATE ROLE` operations on the managed PostgreSQL and
MongoDB clusters. Serves the frontend over `/v1`.

## Stack

Scala 2.13 · Play Framework · Guice (DI) · Slick + play-slick (internal DB) ·
jwt-scala (auth tokens) · Swagger (API docs). Tests: ScalaTest + ScalaMock.
Package root: `com.htwhub.ocean`.

## Layout

Code lives under `app/com/htwhub/ocean/`, config under `conf/`:

| Path            | What it is                                                          |
| --------------- |---------------------------------------------------------------------|
| `controllers/`  | HTTP entry points: one per resource, map to routes, do JSON I/O     |
| `managers/`     | business logic: permissions, cross-resource rules, orchestration    |
| `service/`      | CRUD for internal metadata (users, instances, roles, invitations)   |
| `repositories/` | Slick persistence for the services, against the internal Postgres   |
| `engines/`      | run DDL/DML on the **managed** clusters (`PostgreSQLEngine`, `MongoDBEngine`) |
| `models/`       | domain types (`Instance`, `Role`, `Invitation`, `User`, `Metric`)   |
| `serializers/`  | request/response shapes + validation per resource                   |
| `conf/`         | `routes`, `application.conf` + one HOCON file per subsystem, evolutions |

## The model

A request flows top-down through the layers:

```
routes → Controller → Manager → ┬─ Service → Repository → internal Postgres
                                 └─ Engine  ──────────────→ managed cluster
```

- **Controllers** (`conf/routes` → `*Controller`) handle HTTP and JSON only;
  they delegate to a manager.
- **Managers** are the brain: they enforce permissions and rules, then tie
  together *two* collaborators: the **service** that persists the metadata row,
  and the **engine** that performs the matching operation on the real cluster.
  Creating a "database" means a `Service` writes an `Instance` row **and** the
  `PostgreSQLEngine`/`MongoDBEngine` runs the DDL.
- **Services + repositories** own the internal ORM database (users, instances,
  roles, invitations). **Engines** own the managed clusters Ocean provisions for
  end users. This is the only place raw DDL runs.
- An `Instance` is one provisioned managed database (a `name` + engine type,
  `P` or `M`, owned by a user). The API calls these "databases".

**Auth:** `LdapService` binds against HTW LDAP; on success `TokenService`
issues a JWT (access + refresh). `AuthManager`/`AuthController` handle
sign-in and refresh; protected controllers validate the JWT and derive the user
from it.

**Startup:** `OnStartupService` is an eager singleton (wired in `Module.scala`)
that runs provisioning checks at boot (e.g. creating the LDAP group role in
Postgres).

**Config:** `application.conf` is the entry point and `include`s one file per
subsystem (`slick`, `pg_cluster`, `mongodb_cluster`, `ldap`, …). Each follows
the HOCON `key = "default"` then `key = ${?VAR}` pattern: defaults boot dev
cleanly against the local docker-compose deps, env vars override per
environment. Secrets only ever come from env vars, never committed.

**Migrations:** `conf/evolutions/default/*.sql` (Play evolutions, `!Ups` /
`!Downs`) migrate the **internal** ORM database only, not the managed clusters.

## Running it

Defaults in `application.conf` match the local docker-compose deps (`docker
compose up` at the repo root), so `sbt run` works with no extra config.

```sh
sbt run          # dev mode on :9000
sbt test         # ScalaTest
sbt cov          # clean + coverage + test + report
sbt format       # scalafmt (run before committing)
sbt formatCheck  # scalafmt check (the CI gate)
sbt dist         # production build
```

A single test: `sbt "testOnly com.htwhub.ocean.service.UserServiceSpec"`.
API surface is `/v1` (see `conf/routes`); Swagger UI at `/docs/swagger-ui/`.

## Build & deploy

`Dockerfile` builds with `sbt dist` and runs `bin/backend` as an unprivileged
user on a JRE image; all runtime config flows in via the `${?VAR}` env
overrides. The image is built and shipped by the deploy tooling. See
[`ops/`](../ops/README.md).
