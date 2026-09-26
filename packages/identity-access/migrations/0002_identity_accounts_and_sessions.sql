create table identity_accounts (
  account_id text primary key,
  display_name text not null check (char_length(display_name) between 1 and 128),
  verified_email text not null check (position('@' in verified_email) > 1),
  record_version integer not null default 1 check (record_version > 0),
  created_at timestamptz not null,
  updated_at timestamptz not null check (updated_at >= created_at)
);

create table identity_clerk_links (
  clerk_user_id text primary key,
  account_id text not null unique references identity_accounts(account_id),
  verified_email text not null check (position('@' in verified_email) > 1),
  profile_name text not null check (char_length(profile_name) between 1 and 128),
  record_version integer not null default 1 check (record_version > 0),
  created_at timestamptz not null,
  updated_at timestamptz not null check (updated_at >= created_at),
  unique (clerk_user_id, account_id)
);

create table identity_sessions (
  session_id text primary key,
  account_id text not null references identity_accounts(account_id),
  clerk_user_id text not null references identity_clerk_links(clerk_user_id),
  clerk_session_id text not null unique,
  status text not null check (status in ('active', 'revoked')),
  record_version integer not null default 1 check (record_version > 0),
  created_at timestamptz not null,
  last_activity_at timestamptz not null,
  expires_at timestamptz not null check (expires_at > created_at),
  revoked_at timestamptz,
  constraint identity_sessions_revocation_shape check (
    (status = 'active' and revoked_at is null) or
    (status = 'revoked' and revoked_at is not null)
  ),
  foreign key (clerk_user_id, account_id)
    references identity_clerk_links(clerk_user_id, account_id)
);

create index identity_sessions_account_status
  on identity_sessions (account_id, status, created_at desc);

create table identity_command_receipts (
  idempotency_key text primary key,
  input_digest text not null,
  session_id text not null references identity_sessions(session_id),
  result_json jsonb not null,
  created_at timestamptz not null
);

create table identity_events (
  event_id text primary key,
  event_name text not null check (event_name in ('AccountCreated', 'SessionCreated', 'SessionRevoked')),
  aggregate_id text not null,
  occurred_at timestamptz not null,
  actor_account_id text not null references identity_accounts(account_id),
  event_version integer not null check (event_version = 1)
);

create index identity_events_aggregate
  on identity_events (aggregate_id, occurred_at);

create table identity_webhook_hints (
  delivery_id text primary key,
  event_type text not null check (event_type in ('session.revoked', 'user.deleted', 'user.updated')),
  clerk_object_id text not null,
  occurred_at timestamptz not null,
  input_digest text not null,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  available_at timestamptz not null,
  delivered_at timestamptz,
  last_error_code text check (last_error_code is null or last_error_code = 'DELIVERY_FAILED')
);

create index identity_webhook_hints_pending
  on identity_webhook_hints (available_at, occurred_at, delivery_id)
  where delivered_at is null;
