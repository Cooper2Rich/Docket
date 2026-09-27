create table communications_notice_intents (
  notice_intent_id text primary key,
  initiating_actor_id text not null,
  recipient_account_id text not null,
  audience text not null check (audience = 'authorized_recipient'),
  subject text not null check (char_length(subject) between 1 and 160),
  body text not null check (char_length(body) between 1 and 4000),
  delivery_state text not null check (delivery_state in ('queued', 'retrying', 'delivered', 'failed')),
  record_version integer not null check (record_version >= 1),
  correlation_id text not null,
  causation_id text not null,
  event_version integer not null check (event_version = 1),
  created_at timestamptz not null,
  retained_until timestamptz not null,
  legal_hold boolean not null default false
);

create table communications_module_outbox (
  event_id text primary key,
  aggregate_id text not null references communications_notice_intents(notice_intent_id) on delete cascade,
  event_name text not null check (event_name in ('NoticeRequested', 'NoticeDelivered', 'NoticeDeliveryFailed', 'NoticeEscalated')),
  event_version integer not null check (event_version = 1),
  correlation_id text not null,
  causation_id text not null,
  occurred_at timestamptz not null,
  envelope_json jsonb not null,
  publish_state text not null check (publish_state in ('pending', 'claimed', 'published')),
  claim_owner text,
  claim_expires_at timestamptz,
  publish_attempts integer not null default 0 check (publish_attempts >= 0),
  last_failure_code text,
  published_at timestamptz,
  check (
    (publish_state = 'claimed' and claim_owner is not null and claim_expires_at is not null)
    or (publish_state <> 'claimed' and claim_owner is null and claim_expires_at is null)
  )
);

create index communications_module_outbox_pending_idx
  on communications_module_outbox (publish_state, occurred_at)
  where publish_state <> 'published';

create table communications_notice_receipts (
  idempotency_key text primary key,
  notice_intent_id text not null references communications_notice_intents(notice_intent_id) on delete cascade,
  input_digest text not null,
  result_json jsonb not null
);

create table communications_delivery_attempts (
  delivery_attempt_id text primary key,
  notice_intent_id text not null references communications_notice_intents(notice_intent_id) on delete cascade,
  attempt_number integer not null check (attempt_number >= 1),
  delivery_state text not null check (delivery_state in ('started', 'delivered', 'failed')),
  provider_code text,
  started_at timestamptz not null,
  completed_at timestamptz,
  next_attempt_at timestamptz,
  unique (notice_intent_id, attempt_number)
);

create table communications_inbox_items (
  inbox_item_id text primary key,
  notice_intent_id text not null unique references communications_notice_intents(notice_intent_id) on delete cascade,
  recipient_account_id text not null,
  subject text not null check (char_length(subject) between 1 and 160),
  body text not null check (char_length(body) between 1 and 4000),
  delivery_state text not null check (delivery_state in ('pending', 'delivered', 'delivery_failed')),
  record_version integer not null check (record_version >= 1),
  created_at timestamptz not null
);

create index communications_inbox_recipient_idx
  on communications_inbox_items (recipient_account_id, created_at desc);
