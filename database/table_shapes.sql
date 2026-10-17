alter table public.mesas add column if not exists forma text not null default 'redonda' check (forma in ('redonda','rectangular'));
