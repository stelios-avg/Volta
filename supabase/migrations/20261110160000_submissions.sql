create table public.submissions (
  id uuid primary key,
  title text not null,
  slug text not null,
  description text not null,
  start_date timestamptz not null,
  end_date timestamptz,
  district text not null,
  location_name text not null,
  google_maps_url text,
  category text not null,
  price_text text not null,
  ticket_url text,
  organizer_contact text not null,
  image_url text,
  image_alt text,
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  approve_token_hash text not null,
  reject_token_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.submissions enable row level security;

insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

create policy "public read event images"
on storage.objects for select
to public
using (bucket_id = 'event-images');
