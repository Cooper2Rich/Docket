create table identity_authority_grants (
  grant_id text primary key,
  account_id text not null references identity_accounts(account_id),
  context_kind text not null check (
    context_kind in (
      'school',
      'tournament',
      'judge',
      'platform_administrator',
      'legal_and_privacy_operations'
    )
  ),
  scope_id text not null,
  scope_label text not null check (char_length(scope_label) between 1 and 256),
  permissions jsonb not null check (jsonb_typeof(permissions) = 'array'),
  privileged boolean not null,
  status text not null check (status in ('active', 'revoked')),
  record_version integer not null check (record_version >= 1),
  created_at timestamptz not null,
  updated_at timestamptz not null check (updated_at >= created_at),
  check (
    privileged = (context_kind in ('platform_administrator', 'legal_and_privacy_operations'))
  )
);

create index identity_authority_grants_account_status
  on identity_authority_grants (account_id, status, context_kind, scope_id, grant_id);

alter table identity_accounts
  add column remembered_role_context_grant_id text
    references identity_authority_grants(grant_id);

create table identity_role_contexts (
  role_context_id text primary key,
  account_id text not null references identity_accounts(account_id),
  session_id text not null references identity_sessions(session_id),
  tab_id text not null check (char_length(tab_id) between 1 and 128),
  grant_id text not null references identity_authority_grants(grant_id),
  authority_version integer not null check (authority_version >= 1),
  status text not null check (status in ('active', 'exited')),
  record_version integer not null check (record_version >= 1),
  entered_at timestamptz not null,
  exited_at timestamptz,
  check (
    (status = 'active' and exited_at is null) or
    (status = 'exited' and exited_at is not null and exited_at >= entered_at)
  )
);

create unique index identity_role_contexts_one_active_per_tab
  on identity_role_contexts (account_id, session_id, tab_id)
  where status = 'active';

create table identity_reauthentication_events (
  reauthentication_event_id text primary key,
  account_id text not null references identity_accounts(account_id),
  session_id text not null references identity_sessions(session_id),
  clerk_session_id text not null,
  verification_id text not null unique,
  command_id text not null,
  occurred_at timestamptz not null,
  retained_until timestamptz not null,
  check (retained_until > occurred_at)
);

create index identity_reauthentication_events_account
  on identity_reauthentication_events (account_id, occurred_at desc, reauthentication_event_id);

create table identity_role_context_events (
  event_id text primary key,
  event_name text not null check (
    event_name in ('RoleContextEntered', 'RoleContextExited', 'AuthorityInvalidated')
  ),
  account_id text not null references identity_accounts(account_id),
  role_context_id text not null references identity_role_contexts(role_context_id),
  grant_id text not null references identity_authority_grants(grant_id),
  occurred_at timestamptz not null,
  retention_class text not null check (
    retention_class in ('routine_two_year', 'restricted_seven_year')
  )
);

create index identity_role_context_events_retention
  on identity_role_context_events (retention_class, occurred_at, event_id);

create table identity_role_context_receipts (
  idempotency_key text primary key,
  input_digest text not null,
  result_json jsonb not null
);

create table identity_privileged_context_alert_outbox (
  alert_id text primary key,
  account_id text not null references identity_accounts(account_id),
  session_id text not null references identity_sessions(session_id),
  role_context_id text not null references identity_role_contexts(role_context_id),
  context_kind text not null check (
    context_kind in ('platform_administrator', 'legal_and_privacy_operations')
  ),
  scope_label text not null check (char_length(scope_label) between 1 and 256),
  device text not null check (char_length(device) between 1 and 256),
  approximate_location text not null check (char_length(approximate_location) between 1 and 256),
  restored_at timestamptz not null,
  termination_path text not null check (termination_path = '/account/sessions'),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  available_at timestamptz not null,
  delivered_at timestamptz,
  last_error_code text check (last_error_code in ('DELIVERY_FAILED')),
  check (delivered_at is null or delivered_at >= restored_at)
);

create index identity_privileged_context_alert_outbox_pending
  on identity_privileged_context_alert_outbox (available_at, restored_at, alert_id)
  where delivered_at is null;

create table identity_account_security_alerts (
  alert_id text primary key references identity_privileged_context_alert_outbox(alert_id),
  account_id text not null references identity_accounts(account_id),
  session_id text not null references identity_sessions(session_id),
  role_context_id text not null references identity_role_contexts(role_context_id),
  context_kind text not null check (
    context_kind in ('platform_administrator', 'legal_and_privacy_operations')
  ),
  scope_label text not null check (char_length(scope_label) between 1 and 256),
  device text not null check (char_length(device) between 1 and 256),
  approximate_location text not null check (char_length(approximate_location) between 1 and 256),
  occurred_at timestamptz not null,
  termination_path text not null check (termination_path = '/account/sessions'),
  published_at timestamptz not null check (published_at >= occurred_at)
);

create index identity_account_security_alerts_account
  on identity_account_security_alerts (account_id, occurred_at desc, alert_id);
