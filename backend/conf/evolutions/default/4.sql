-- Add Roles

-- !Ups

create table invitations
(
    id          BIGSERIAL PRIMARY KEY,
    instance_id BIGSERIAL not null references instances (id),
    user_id     BIGSERIAL not null references users (id),
    created_at  timestamp not null
);

CREATE UNIQUE INDEX unique_instanceId_userId ON invitations(instance_id, user_id);

-- !Downs

drop table "invitations" if exists;