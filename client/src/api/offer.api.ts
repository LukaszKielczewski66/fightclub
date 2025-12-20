import { http } from "./http";
import type { OfferTemplatesResponse } from "@/types/offerTemplates";

export async function getOfferTemplatesApi(args: { token: string }): Promise<OfferTemplatesResponse> {
  const res = await http.get<OfferTemplatesResponse>("/offer/templates", {
    headers: { Authorization: `Bearer ${args.token}` },
  });
  return res.data;
}
