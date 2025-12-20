import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import { getOfferTemplatesApi } from "@/api/offer.api";
import type { OfferTemplatesResponse } from "@/types/offerTemplates";

export function useOfferTemplates() {
  const { token } = useAuth();

  return useQuery<OfferTemplatesResponse, unknown>({
    queryKey: ["offer-templates"],
    enabled: !!token,
    queryFn: async () => {
      if (!token) throw new Error("Brak tokenu");
      return getOfferTemplatesApi({ token });
    },
  });
}
