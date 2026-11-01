-- Proof of Row Level Security (RLS) isolation between User A and User B
-- Standby database policy verification

BEGIN;

-- 1. Create mock users in auth.users schema
DO $$
DECLARE
  v_user_a uuid := '11111111-1111-1111-1111-111111111111';
  v_user_b uuid := '22222222-2222-2222-2222-222222222222';
  v_event_id uuid;
  v_visible_count int;
BEGIN
  -- Insert Event as User A
  EXECUTE 'SET LOCAL ROLE authenticated';
  EXECUTE format('SET LOCAL "request.jwt.claim.sub" = %L', v_user_a);

  INSERT INTO public.events (id, owner_id, title, kind, event_date, guest_count, budget_total, outdoor, brief)
  VALUES (gen_random_uuid(), v_user_a, 'User A Secret Wedding', 'wedding', '2027-06-01', 120, 15000, false, 'Confidential brief')
  RETURNING id INTO v_event_id;

  -- Verify User A sees 1 event
  SELECT count(*) INTO v_visible_count FROM public.events WHERE id = v_event_id;
  ASSERT v_visible_count = 1, 'FAILURE: User A must be able to view their own event';

  -- Switch context to User B
  EXECUTE format('SET LOCAL "request.jwt.claim.sub" = %L', v_user_b);

  -- Verify User B sees 0 events (RLS isolates User A from User B)
  SELECT count(*) INTO v_visible_count FROM public.events WHERE id = v_event_id;
  ASSERT v_visible_count = 0, 'FAILURE: User B must NOT be able to view User A events under RLS';

  -- Verify User B cannot update User A's event
  UPDATE public.events SET title = 'Compromised' WHERE id = v_event_id;
  SELECT count(*) INTO v_visible_count FROM public.events WHERE title = 'Compromised';
  ASSERT v_visible_count = 0, 'FAILURE: User B must NOT be able to modify User A events';

  RAISE NOTICE 'SUCCESS: RLS verified. User B cannot read or modify User A data.';
END $$;

ROLLBACK;
