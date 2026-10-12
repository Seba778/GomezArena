-- Holds are now created only by the crear-checkout Edge Function (service role), which ties each
-- hold to a Stripe Checkout Session. Visitors can no longer create holds directly from the browser.
-- Run this only after the website using crear-checkout is live.
revoke execute on function public.reservar_mesa(text, int, text, text, text) from anon, authenticated;
