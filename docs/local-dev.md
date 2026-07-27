# Local development

Run the full Ocean stack on your machine. The backend and frontend run directly;
their dependencies (LDAP + databases) run in Docker using Docker Compose.

## Prerequisites

- Docker + Docker Compose
- JDK 17 and [sbt](https://www.scala-sbt.org/)
- Node.js 20+ and npm

## 1. Start the dependencies

```sh
docker compose up
```

## 2. Start the backend

```sh
cd backend
sbt run
```

## 3. Start the frontend

```sh
cd frontend
cp .env.example .env #create a real .env file from the example strucutre
npm install
npm run dev
```


## 4. Log in

Open http://localhost:5173 and sign in with a seeded user:

| Username | Password    | Role    |
| -------- | ----------- | ------- |
| `user01` | `password1` | Staff   |
| `user02` | `password2` | Student |
| `user03` | `password3` | Student |

Users are seeded in the root [docker compose](../docker-compose.yaml) file.

## Run the tests

```sh
cd backend  && sbt test
cd frontend && npm run vitest
```

## Common issues

- If Docker Compose reports that a port is already in use, stop the local
  PostgreSQL, MongoDB, LDAP, or Adminer process using that port, then retry.
- If seeded LDAP users are missing after changing the seed, run
  `docker compose down --volumes` and start again. This deletes all local-only
  development database data.
