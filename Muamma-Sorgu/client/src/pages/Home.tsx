import { usePublicQuestions, useCreateQuestion } from "@/hooks/use-questions";
import { QuestionCard } from "@/components/QuestionCard";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertQuestionSchema, type InsertQuestion } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, ScrollText, SendHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: questions, isLoading } = usePublicQuestions();
  const createMutation = useCreateQuestion();

  const form = useForm<InsertQuestion>({
    resolver: zodResolver(insertQuestionSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = (data: InsertQuestion) => {
    createMutation.mutate(data, {
      onSuccess: () => form.reset(),
    });
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <header className="relative pt-24 pb-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <h1 className="text-6xl md:text-8xl font-serif text-primary tracking-tight">
            Muamma
          </h1>
          <p className="text-xl md:text-2xl font-body text-muted-foreground italic max-w-lg mx-auto leading-relaxed">
            "Bazı sorular cevap istemez. Sadece düşünülmek ister."
          </p>
          <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full mt-8" />
        </motion.div>
      </header>

      {/* Submission Form */}
      <section className="max-w-xl mx-auto px-4 mb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white p-6 md:p-8 rounded-lg shadow-xl shadow-stone-200/50 border border-stone-100 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40" />
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Zihnini kurcalayan o soruyu yaz..."
                        className="resize-none font-serif text-lg bg-stone-50/50 border-stone-200 focus:border-primary/30 min-h-[120px] p-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="font-serif italic" />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="font-serif bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg transition-all duration-300"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      Gönder <SendHorizontal className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </section>

      {/* Questions Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
          </div>
        ) : questions?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground font-serif italic">
            <ScrollText className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Henüz hiç muamma yok. İlkini sen sor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {questions?.map((question, i) => (
              <QuestionCard key={question.id} question={question} index={i} />
            ))}
          </div>
        )}
      </main>
      
      <footer className="text-center py-12 mt-12 border-t border-stone-200/50 text-stone-400 font-serif text-sm italic">
        <p>Muamma © {new Date().getFullYear()} — Düşünceler özgürdür.</p>
      </footer>
    </div>
  );
}
