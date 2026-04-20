create table if not exists public.loans (
  id text primary key,
  name text not null,
  amount numeric not null default 0,
  note text default '',
  payments jsonb not null default '[]'::jsonb,
  loan_date text,
  reminder_date timestamptz,
  reminder_repeat text not null default 'NONE',
  is_paid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  notification_id text,
  language text not null default 'roman_urdu'
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_loans_updated_at on public.loans;
create trigger trg_loans_updated_at
before update on public.loans
for each row
execute function public.set_updated_at();
