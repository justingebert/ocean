-- Add Roles

-- !Ups

create table roles
(
    id          BIGSERIAL PRIMARY KEY,
    instance_id BIGSERIAL not null references instances (id),
    name        varchar   not null,
    password    varchar   not null
);

CREATE UNIQUE INDEX unique_instanceId_name ON roles(instance_id, name);

-- !Downs

drop table "roles" if exists;