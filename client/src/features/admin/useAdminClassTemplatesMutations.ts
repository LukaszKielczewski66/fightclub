import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import { createClassTemplateApi, updateClassTemplateApi } from "@/api/adminClasses.api";
import type { ClassTemplateItem, CreateClassTemplatePayload, UpdateClassTemplatePayload } from "@/types/adminClasses";

export function useCreateClassTemplate() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation<ClassTemplateItem, unknown, CreateClassTemplatePayload>({
    mutationFn: async (payload) => {
      if (!token) throw new Error("Brak tokenu");
      return createClassTemplateApi({ token, payload });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-class-templates"] });
    },
  });
}

export function useUpdateClassTemplate() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation<ClassTemplateItem, unknown, { id: string; payload: UpdateClassTemplatePayload }>({
    mutationFn: async ({ id, payload }) => {
      if (!token) throw new Error("Brak tokenu");
      return updateClassTemplateApi({ token, id, payload });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-class-templates"] });
    },
  });
}
