-- Autorise les patients (visiteurs anonymes) à ENVOYER une demande de rendez-vous,
-- sans pouvoir LIRE les demandes des autres patients.
-- À exécuter une fois dans Supabase → SQL Editor.

-- 1. Droits de table
grant insert on table public.appointments to anon;
grant select, insert, update, delete on table public.appointments to authenticated;

-- 2. Sécurité ligne par ligne
alter table public.appointments enable row level security;

-- Patients anonymes : création uniquement, toujours au statut "en attente"
drop policy if exists "patients_peuvent_creer_une_demande" on public.appointments;
create policy "patients_peuvent_creer_une_demande"
  on public.appointments
  for insert
  to anon
  with check (status = 'en_attente');

-- Praticien connecté (espace admin) : accès complet
drop policy if exists "praticien_acces_complet" on public.appointments;
create policy "praticien_acces_complet"
  on public.appointments
  for all
  to authenticated
  using (true)
  with check (true);
