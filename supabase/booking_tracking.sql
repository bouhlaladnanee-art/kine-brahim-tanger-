-- Suivi de réservation côté patient + proposition d'un autre horaire par le kiné.
-- À exécuter une fois dans Supabase → SQL Editor (après fix_appointments_insert.sql).
--
-- Principe : chaque demande reçoit un jeton secret (tracking_token). Le patient ne peut
-- PAS lire la table ; il passe par des fonctions qui ne renvoient QUE la demande liée
-- à son jeton, et seulement les champs utiles au suivi.

-- 1. Nouvelles colonnes
alter table public.appointments
  add column if not exists tracking_token uuid unique,
  add column if not exists proposed_date date,
  add column if not exists proposed_time_slot text,
  add column if not exists proposed_time_label text,
  add column if not exists kine_message text,
  add column if not exists patient_response text;

-- 2. Règle de création côté patient : demande "en attente", avec jeton, sans champs réservés au kiné
drop policy if exists "patients_peuvent_creer_une_demande" on public.appointments;
create policy "patients_peuvent_creer_une_demande"
  on public.appointments
  for insert
  to anon
  with check (
    status = 'en_attente'
    and tracking_token is not null
    and proposed_date is null
    and kine_message is null
    and patient_response is null
  );

-- 3. Lecture d'UNE demande par son jeton
create or replace function public.get_appointment_by_token(p_token uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'patientName',       patient_name,
    'careTypeTitle',     care_type_title,
    'date',              date,
    'timeSlot',          time_slot,
    'timeSlotLabel',     time_slot_hours,
    'status',            status,
    'proposedDate',      proposed_date,
    'proposedTimeSlot',  proposed_time_slot,
    'proposedTimeLabel', proposed_time_label,
    'kineMessage',       kine_message,
    'patientResponse',   patient_response,
    'createdAt',         created_at,
    'updatedAt',         updated_at
  )
  from public.appointments
  where tracking_token = p_token
  limit 1;
$$;

-- 4. Réponse du patient à un horaire proposé par le kiné
create or replace function public.respond_to_proposal(p_token uuid, p_accept boolean)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.appointments;
begin
  select * into r
  from public.appointments
  where tracking_token = p_token
    and proposed_date is not null
    and status = 'en_attente'
  for update;

  if not found then
    raise exception 'Aucune proposition en cours pour cette demande';
  end if;

  if p_accept then
    update public.appointments
       set date                = r.proposed_date,
           time_slot           = r.proposed_time_slot,
           time_slot_hours     = r.proposed_time_label,
           status              = 'confirme',
           proposed_date       = null,
           proposed_time_slot  = null,
           proposed_time_label = null,
           patient_response    = 'accepte',
           updated_at          = now()
     where tracking_token = p_token;
  else
    update public.appointments
       set proposed_date       = null,
           proposed_time_slot  = null,
           proposed_time_label = null,
           patient_response    = 'refuse',
           updated_at          = now()
     where tracking_token = p_token;
  end if;

  return public.get_appointment_by_token(p_token);
end;
$$;

-- 5. Annulation par le patient (tant que la séance n'a pas eu lieu)
create or replace function public.cancel_appointment_by_token(p_token uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.appointments
     set status           = 'annule',
         patient_response = 'annule_par_patient',
         updated_at       = now()
   where tracking_token = p_token
     and status in ('en_attente', 'confirme');

  if not found then
    raise exception 'Cette demande ne peut plus être annulée';
  end if;

  return public.get_appointment_by_token(p_token);
end;
$$;

-- 6. Droits d'exécution
revoke all on function public.get_appointment_by_token(uuid) from public;
revoke all on function public.respond_to_proposal(uuid, boolean) from public;
revoke all on function public.cancel_appointment_by_token(uuid) from public;
grant execute on function public.get_appointment_by_token(uuid) to anon, authenticated;
grant execute on function public.respond_to_proposal(uuid, boolean) to anon, authenticated;
grant execute on function public.cancel_appointment_by_token(uuid) to anon, authenticated;
