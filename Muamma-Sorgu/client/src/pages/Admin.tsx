import { useState } from "react";
import { useUser, useLogin, useLogout } from "@/hooks/use-auth";
import { useAdminQuestions, useUpdateQuestionStatus, useDeleteQuestion } from "@/hooks/use-questions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser, type Question } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogOut, CheckCircle, XCircle, Clock, Trash2, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

function AdminLogin() {
  const loginMutation = useLogin();
  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { username: "", password: "" },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100/50 px-4">
      <Card className="w-full max-w-md shadow-xl border-stone-200">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="font-serif text-2xl">Yönetici Girişi</CardTitle>
          <CardDescription>Muamma yönetim paneli</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => loginMutation.mutate(d))} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kullanıcı Adı</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} className="bg-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-serif" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function QuestionRow({ question }: { question: Question }) {
  const updateMutation = useUpdateQuestionStatus();
  const deleteMutation = useDeleteQuestion();

  const handleStatus = (status: "pending" | "approved" | "rejected") => {
    updateMutation.mutate({ id: question.id, status });
  };

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group">
      <div className="flex-1 space-y-2">
        <p className="font-serif text-lg text-foreground/90">{question.content}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{question.createdAt ? format(new Date(question.createdAt), "d MMMM yyyy HH:mm", { locale: tr }) : "-"}</span>
          <Badge variant={question.status === "approved" ? "default" : question.status === "rejected" ? "destructive" : "secondary"}>
            {question.status === "approved" ? "Yayında" : question.status === "rejected" ? "Reddedildi" : "Beklemede"}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        {question.status !== "approved" && (
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 md:flex-none border-green-200 hover:bg-green-50 text-green-700 hover:text-green-800"
            onClick={() => handleStatus("approved")}
            disabled={updateMutation.isPending}
          >
            <CheckCircle className="w-4 h-4 mr-2" /> Yayınla
          </Button>
        )}
        
        {question.status !== "pending" && (
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 md:flex-none border-yellow-200 hover:bg-yellow-50 text-yellow-700 hover:text-yellow-800"
            onClick={() => handleStatus("pending")}
            disabled={updateMutation.isPending}
          >
            <Clock className="w-4 h-4 mr-2" /> Beklet
          </Button>
        )}

        {question.status !== "rejected" && (
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 md:flex-none border-red-200 hover:bg-red-50 text-red-700 hover:text-red-800"
            onClick={() => handleStatus("rejected")}
            disabled={updateMutation.isPending}
          >
            <XCircle className="w-4 h-4 mr-2" /> Reddet
          </Button>
        )}

        <Button
          size="icon"
          variant="ghost"
          className="text-stone-400 hover:text-destructive hover:bg-red-50"
          onClick={() => deleteMutation.mutate(question.id)}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function Admin() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const { data: questions, isLoading: isQuestionsLoading } = useAdminQuestions();
  const logoutMutation = useLogout();
  const [activeTab, setActiveTab] = useState("pending");

  if (isUserLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user) return <AdminLogin />;

  const filteredQuestions = questions?.filter(q => q.status === activeTab) || [];

  return (
    <div className="min-h-screen bg-stone-50/50">
      <header className="bg-white border-b border-stone-200 px-4 py-4 md:px-8 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <h1 className="font-serif text-2xl text-primary">Muamma Panel</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden md:inline">Admin: {user.username}</span>
          <Button variant="outline" size="sm" onClick={() => logoutMutation.mutate()}>
            <LogOut className="w-4 h-4 mr-2" /> Çıkış
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <TabsList className="bg-stone-200/50 p-1">
              <TabsTrigger value="pending" className="data-[state=active]:bg-white font-serif">
                Bekleyenler ({questions?.filter(q => q.status === "pending").length || 0})
              </TabsTrigger>
              <TabsTrigger value="approved" className="data-[state=active]:bg-white font-serif">
                Yayındakiler ({questions?.filter(q => q.status === "approved").length || 0})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="data-[state=active]:bg-white font-serif">
                Reddedilenler ({questions?.filter(q => q.status === "rejected").length || 0})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pending" className="space-y-4">
            {isQuestionsLoading ? <Loader2 className="animate-spin mx-auto" /> : 
             filteredQuestions.length === 0 ? <p className="text-center text-muted-foreground py-10 font-serif italic">Bekleyen soru yok.</p> :
             filteredQuestions.map(q => <QuestionRow key={q.id} question={q} />)}
          </TabsContent>
          
          <TabsContent value="approved" className="space-y-4">
            {isQuestionsLoading ? <Loader2 className="animate-spin mx-auto" /> :
             filteredQuestions.length === 0 ? <p className="text-center text-muted-foreground py-10 font-serif italic">Yayında soru yok.</p> :
             filteredQuestions.map(q => <QuestionRow key={q.id} question={q} />)}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {isQuestionsLoading ? <Loader2 className="animate-spin mx-auto" /> :
             filteredQuestions.length === 0 ? <p className="text-center text-muted-foreground py-10 font-serif italic">Reddedilmiş soru yok.</p> :
             filteredQuestions.map(q => <QuestionRow key={q.id} question={q} />)}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
