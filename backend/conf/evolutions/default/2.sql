-- Add Databases

-- !Ups

create table instances
(
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGSERIAL not null references users (id),
    name       varchar   not null,
    engine     varchar   not null,
    created_at timestamp not null
);

CREATE UNIQUE INDEX unique_name_engine ON instances(name, engine);

-- !Downs

drop table "instances" if exists;