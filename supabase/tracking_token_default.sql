-- Filet de sécurité : si un téléphone utilise encore une ancienne version du site
-- (sans jeton de suivi), la base en génère un automatiquement au lieu de refuser la demande.
-- À exécuter une fois dans Supabase → SQL Editor.
alter table public.appointments
  alter column tracking_token set default gen_random_uuid();
