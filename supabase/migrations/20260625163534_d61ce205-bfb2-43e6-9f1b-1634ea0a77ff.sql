DROP POLICY IF EXISTS "Anyone can post a review" ON public.reviews;
CREATE POLICY "Anyone can post a valid review" ON public.reviews
FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 80
  AND rating BETWEEN 1 AND 5
  AND char_length(btrim(message)) BETWEEN 1 AND 2000
);