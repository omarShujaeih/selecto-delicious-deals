insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'selecto_images',
  'selecto_images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "selecto images public read" on storage.objects;
create policy "selecto images public read"
on storage.objects
for select
using (bucket_id = 'selecto_images');

drop policy if exists "selecto images authenticated upload" on storage.objects;
create policy "selecto images authenticated upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'selecto_images');

drop policy if exists "selecto images authenticated update" on storage.objects;
create policy "selecto images authenticated update"
on storage.objects
for update
to authenticated
using (bucket_id = 'selecto_images')
with check (bucket_id = 'selecto_images');

drop policy if exists "selecto images authenticated delete" on storage.objects;
create policy "selecto images authenticated delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'selecto_images');
