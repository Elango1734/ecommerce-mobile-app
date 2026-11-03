import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { queryKeys } from '@/api/queryClient';
import type { CreateAddressPayload } from '@shopsphere/api-client';

export function useAddresses() {
  return useQuery({ queryKey: queryKeys.addresses, queryFn: () => api.profile.listAddresses() });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAddressPayload) => api.profile.createAddress(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses })
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressId: string) => api.profile.deleteAddress(addressId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses })
  });
}
