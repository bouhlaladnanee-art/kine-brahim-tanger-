-- Permet aux patients de VOIR le planning du kiné (créneaux ouverts / jours bloqués).
-- Sans ce droit, le site patient garde le planning par défaut et ignore les changements faits dans l'admin.
-- À exécuter une fois dans Supabase → SQL Editor.

grant select on table public.availability to anon, authenticated;
grant update on table public.availability to authenticated;

drop policy if exists "lecture_publique_disponibilites" on public.availability;
create policy "lecture_publique_disponibilites"
  on public.availability
  for select
  to anon, authenticated
  using (true);

-- Contrôle : doit afficher le planning enregistré
select id, weekly_template, custom_dates, blocked_dates, updated_at from public.availability;
