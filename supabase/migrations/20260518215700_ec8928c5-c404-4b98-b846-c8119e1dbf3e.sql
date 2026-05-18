
alter function public.set_commission() set search_path = public;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_commission() from public, anon, authenticated;
