create table platform_migration_journal (
  event_id bigint generated always as identity primary key,
  migration_order integer not null check (migration_order > 0),
  migration_id text not null check (migration_id ~ '^[0-9]{4}_[a-z0-9_]+$'),
  owner text not null,
  checksum text not null check (checksum ~ '^[a-f0-9]{64}$'),
  outcome text not null check (outcome in ('applied', 'failed')),
  occurred_at timestamptz not null,
  failure_code text,
  constraint platform_migration_journal_failure_shape check (
    (outcome = 'applied' and failure_code is null) or
    (outcome = 'failed' and failure_code is not null)
  )
);

create unique index platform_migration_journal_applied_order
  on platform_migration_journal (migration_order)
  where outcome = 'applied';

create unique index platform_migration_journal_applied_identity
  on platform_migration_journal (migration_id)
  where outcome = 'applied';

create or replace function platform_migration_journal_immutable_guard()
returns trigger
language plpgsql
as $$
begin
  raise exception 'platform_migration_journal rows are immutable'
    using errcode = '55000';
end;
$$;

create trigger platform_migration_journal_immutable
before update or delete on platform_migration_journal
for each row execute function platform_migration_journal_immutable_guard();
