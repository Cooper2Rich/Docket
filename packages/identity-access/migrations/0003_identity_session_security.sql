alter table identity_sessions
  add column session_class text not null default 'ordinary'
    check (session_class in ('ordinary', 'privileged')),
  add column device text not null default 'Unknown device'
    check (char_length(device) between 1 and 256),
  add column approximate_location text not null default 'Approximate location unavailable'
    check (char_length(approximate_location) between 1 and 256),
  add column privileged_activated_at timestamptz;

alter table identity_sessions
  add constraint identity_sessions_privileged_activation_shape check (
    (session_class = 'ordinary' and privileged_activated_at is null) or
    (session_class = 'privileged' and privileged_activated_at is not null)
  );

alter table identity_accounts
  add column display_name_changed_at timestamptz;

alter table identity_accounts
  add constraint identity_accounts_display_name_change_time
    check (display_name_changed_at is null or display_name_changed_at >= created_at);

update identity_sessions
set expires_at = least(expires_at, created_at + interval '168 hours');

create index identity_sessions_account_class_status
  on identity_sessions (account_id, session_class, status, created_at, session_id);

create table identity_clerk_session_terminations (
  session_id text primary key references identity_sessions (session_id),
  clerk_session_id text not null unique,
  requested_at timestamptz not null,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  available_at timestamptz not null,
  delivered_at timestamptz,
  last_error_code text check (last_error_code in ('DELIVERY_FAILED')),
  check (delivered_at is null or delivered_at >= requested_at)
);

create index identity_clerk_session_terminations_pending
  on identity_clerk_session_terminations (available_at, requested_at, session_id)
  where delivered_at is null;

create table identity_display_name_history (
  history_id text primary key,
  account_id text not null references identity_accounts(account_id),
  display_name text not null check (char_length(display_name) between 1 and 128),
  effective_at timestamptz not null,
  change_kind text not null
    check (change_kind in ('initial', 'self_service', 'reviewed_correction')),
  review_id text unique,
  approved_by_account_id text references identity_accounts(account_id),
  constraint identity_display_name_history_review_shape check (
    (change_kind in ('initial', 'self_service') and review_id is null and approved_by_account_id is null) or
    (change_kind = 'reviewed_correction' and review_id is not null and approved_by_account_id is not null)
  )
);

insert into identity_display_name_history (
  history_id,
  account_id,
  display_name,
  effective_at,
  change_kind
)
select
  'display-name-initial:' || account_id,
  account_id,
  display_name,
  created_at,
  'initial'
from identity_accounts;

create index identity_display_name_history_account
  on identity_display_name_history (account_id, effective_at desc, history_id);

create table identity_account_security_history (
  history_id text primary key,
  account_id text not null references identity_accounts(account_id),
  history_kind text not null
    check (history_kind in ('accepted_sign_in', 'clerk_reverification', 'account_suspension')),
  occurred_at timestamptz not null,
  retained_until timestamptz not null,
  legal_hold boolean not null default false,
  device text check (device is null or char_length(device) between 1 and 256),
  approximate_location text
    check (approximate_location is null or char_length(approximate_location) between 1 and 256),
  suspension_status text
    check (suspension_status in ('imposed', 'reinstated', 'expired')),
  constraint identity_account_security_history_retention
    check (
      retained_until =
        ((occurred_at at time zone 'UTC') + interval '2 years') at time zone 'UTC'
    ),
  constraint identity_account_security_history_shape check (
    (history_kind = 'accepted_sign_in' and device is not null and approximate_location is not null and suspension_status is null) or
    (history_kind = 'clerk_reverification' and device is null and approximate_location is null and suspension_status is null) or
    (history_kind = 'account_suspension' and device is null and approximate_location is null and suspension_status is not null)
  )
);

insert into identity_account_security_history (
  history_id,
  account_id,
  history_kind,
  occurred_at,
  retained_until,
  legal_hold,
  device,
  approximate_location,
  suspension_status
)
select
  'accepted-sign-in:' || session_id,
  account_id,
  'accepted_sign_in',
  created_at,
  ((created_at at time zone 'UTC') + interval '2 years') at time zone 'UTC',
  false,
  device,
  approximate_location,
  null
from identity_sessions
where
  ((created_at at time zone 'UTC') + interval '2 years') at time zone 'UTC' > current_timestamp;

create index identity_account_security_history_account
  on identity_account_security_history (account_id, occurred_at desc, history_id);

create index identity_account_security_history_expiry
  on identity_account_security_history (retained_until, history_id)
  where legal_hold = false;
