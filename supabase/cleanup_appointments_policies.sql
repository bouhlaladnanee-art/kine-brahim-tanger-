-- À exécuter une fois dans Supabase → SQL Editor, après fix_appointments_insert.sql.

-- 1. Supprimer les 2 demandes de test créées pendant la vérification
delete from public.appointments
where patient_phone = '0600000000'
  and patient_name in ('TEST', 'TEST CLAUDE - a supprimer');

-- 2. Retirer les anciennes règles trop permissives sur appointments
--    (une ancienne règle laissait un visiteur créer une demande déjà "confirmée").
--    On ne garde que les deux règles créées par fix_appointments_insert.sql.
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public'
      and tablename = 'appointments'
      and policyname not in ('patients_peuvent_creer_une_demande', 'praticien_acces_complet')
  loop
    execute format('drop policy %I on public.appointments', p.policyname);
  end loop;
end $$;

-- 3. Contrôle : doit lister exactement les 2 règles ci-dessus
select policyname, roles, cmd from pg_policies
where schemaname = 'public' and tablename = 'appointments';
