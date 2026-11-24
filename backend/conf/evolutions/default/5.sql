-- Add database expiry

-- !Ups

alter table instances add column expires_at timestamp null;
alter table instances add column reminders_sent int not null default 0;

-- Existing databases at rollout. Evolutions can't read app config, so this
-- hard-codes the default ocean.cleanup.lifetime-days.
update instances set expires_at = now() + interval '180 days';

-- !Downs

alter table instances drop column reminders_sent;
alter table instances drop column expires_at;
