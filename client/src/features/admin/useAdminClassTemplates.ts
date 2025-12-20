import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import { listClassTemplatesApi } from "@/api/adminClasses.api";
import type { ListClassTemplatesParams, ListClassTemplatesResponse } from "@/types/adminClasses";

export function useAdminClassTemplates(params: ListClassTemplatesParams) {
  const { token } = useAuth();

  return useQuery<ListClassTemplatesResponse, unknown>({
    queryKey: ["admin-class-templates", params],
    enabled: !!token,
    queryFn: async () => {
      if (!token) throw new Error("Brak tokenu");
      return listClassTemplatesApi({ token, params });
    },
  });
}
