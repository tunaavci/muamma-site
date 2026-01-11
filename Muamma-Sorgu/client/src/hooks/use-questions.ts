import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertQuestion } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function usePublicQuestions() {
  return useQuery({
    queryKey: [api.questions.listPublic.path],
    queryFn: async () => {
      const res = await fetch(api.questions.listPublic.path);
      if (!res.ok) throw new Error("Failed to fetch questions");
      return api.questions.listPublic.responses[200].parse(await res.json());
    },
  });
}

export function useAdminQuestions() {
  return useQuery({
    queryKey: [api.questions.listAll.path],
    queryFn: async () => {
      const res = await fetch(api.questions.listAll.path, { credentials: "include" });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch admin questions");
      return api.questions.listAll.responses[200].parse(await res.json());
    },
    retry: false,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertQuestion) => {
      const validated = api.questions.create.input.parse(data);
      const res = await fetch(api.questions.create.path, {
        method: api.questions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.questions.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to submit question");
      }
      return api.questions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: "Muamma Gönderildi",
        description: "Sorunuz evrenin boşluğuna bırakıldı. Onaylanırsa burada belirecek.",
      });
      // Not invalidating public list because it needs approval first
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateQuestionStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "pending" | "approved" | "rejected" }) => {
      const url = buildUrl(api.questions.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.questions.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update status");
      return api.questions.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.questions.listAll.path] });
      queryClient.invalidateQueries({ queryKey: [api.questions.listPublic.path] });
      toast({
        title: "Durum Güncellendi",
        description: "Muamma durumu başarıyla değiştirildi.",
      });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.questions.delete.path, { id });
      const res = await fetch(url, { 
        method: api.questions.delete.method,
        credentials: "include" 
      });

      if (!res.ok) throw new Error("Failed to delete question");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.questions.listAll.path] });
      toast({
        title: "Silindi",
        description: "Soru sonsuzluğa karıştı.",
      });
    },
  });
}
