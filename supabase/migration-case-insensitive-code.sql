-- Make group codes case-insensitive for lookups while preserving the creator's casing.
-- Adds a unique lowercase index so codes cannot collide across cases.

CREATE UNIQUE INDEX IF NOT EXISTS clubs_code_lower_idx ON public.clubs (lower(code));

CREATE OR REPLACE FUNCTION public.create_club(p_name text, p_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_code text;
  v_club uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  IF coalesce(trim(p_name), '') = '' THEN
    RAISE EXCEPTION 'Group name is required';
  END IF;
  v_code := trim(p_code);
  IF length(v_code) < 3 THEN
    RAISE EXCEPTION 'Group code must be at least 3 characters';
  END IF;
  IF EXISTS (SELECT 1 FROM public.clubs WHERE lower(code) = lower(v_code)) THEN
    RAISE EXCEPTION 'Group code is already taken';
  END IF;
  INSERT INTO public.clubs (name, code, created_by)
  VALUES (trim(p_name), v_code, auth.uid())
  RETURNING id INTO v_club;
  PERFORM set_config('app.allow_membership_change', '1', true);
  UPDATE public.profiles
  SET club_id = v_club, role = 'Organizer', status = 'approved'
  WHERE id = auth.uid();
  RETURN v_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.join_club(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_club uuid;
  v_name text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  IF (SELECT club_id FROM public.profiles WHERE id = auth.uid()) IS NOT NULL THEN
    RAISE EXCEPTION 'You are already in a group';
  END IF;
  SELECT id INTO v_club FROM public.clubs WHERE lower(code) = lower(trim(p_code));
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  PERFORM set_config('app.allow_membership_change', '1', true);
  UPDATE public.profiles
  SET club_id = v_club, role = 'Member', status = 'pending'
  WHERE id = auth.uid();
  SELECT name INTO v_name FROM public.profiles WHERE id = auth.uid();
  INSERT INTO public.notifications (user_id, text, link)
  SELECT id,
    coalesce(nullif(v_name, ''), 'Someone') || ' wants to join the group — approve them on the Members page',
    '/members'
  FROM public.profiles
  WHERE club_id = v_club AND role IN ('Organizer', 'Admin') AND status = 'approved';
  RETURN true;
END;
$$;
