import { http } from "./http";
import type {
  ClassTemplateItem,
  CreateClassTemplatePayload,
  ListClassTemplatesParams,
  ListClassTemplatesResponse,
  UpdateClassTemplatePayload,
} from "@/types/adminClasses";

export async function listClassTemplatesApi(args: {
  token: string;
  params?: ListClassTemplatesParams;
}): Promise<ListClassTemplatesResponse> {
  const res = await http.get<ListClassTemplatesResponse>("/admin/classes/templates", {
    headers: { Authorization: `Bearer ${args.token}` },
    params: {
      query: args.params?.query ?? undefined,
      type: args.params?.type ?? undefined,
      active: typeof args.params?.active === "boolean" ? String(args.params.active) : undefined,
      sort: args.params?.sort ?? "createdAt:desc",
    },
  });

  return res.data;
}

export async function createClassTemplateApi(args: {
  token: string;
  payload: CreateClassTemplatePayload;
}): Promise<ClassTemplateItem> {
  const res = await http.post<ClassTemplateItem>("/admin/classes/templates", args.payload, {
    headers: { Authorization: `Bearer ${args.token}` },
  });
  return res.data;
}

export async function updateClassTemplateApi(args: {
  token: string;
  id: string;
  payload: UpdateClassTemplatePayload;
}): Promise<ClassTemplateItem> {
  const res = await http.patch<ClassTemplateItem>(`/admin/classes/templates/${args.id}`, args.payload, {
    headers: { Authorization: `Bearer ${args.token}` },
  });
  return res.data;
}
