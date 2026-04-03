-- Storage bucket for admin-uploaded site assets (logo/favicon).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-branding',
  'site-branding',
  true,
  5242880,
  array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml',
    'image/x-icon',
    'image/vnd.microsoft.icon'
  ]::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'site_branding_public_read'
  ) then
    create policy "site_branding_public_read"
      on storage.objects
      for select
      to anon, authenticated
      using (bucket_id = 'site-branding');
  end if;
end $$;

