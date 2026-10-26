-- Event-trigger helper; it never needs to be reachable through /rest/v1/rpc.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
