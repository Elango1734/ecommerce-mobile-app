import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryClient';
import type { CheckoutPayload } from '@shopsphere/api-client';

/**
 * One idempotency key per checkout *attempt* (the screen's lifetime), reused
 * across retries of the same tap-to-pay so a network retry or duplicate tap
 * cannot create two orders (api-specification.md's Idempotency-Key
 * contract). A fresh key is only minted if the screen remounts (e.g. the
 * customer backs out and starts a new checkout) — see checkout.tsx mounting
 * a new instance of this hook per visit.
 */
export function useCheckout() {
  const queryClient = useQueryClient();
  const idempotencyKeyRef = useRef<string>(uuidv4());

  return useMutation({
    mutationFn: (payload: CheckoutPayload) => api.checkout.checkout(payload, idempotencyKeyRef.current),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    }
  });
}
