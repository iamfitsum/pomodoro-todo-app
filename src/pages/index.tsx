import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import { useEffect, useState } from "react";
import AnalyticsDashboard from "~/components/AnalyticsDashboard";
import EditTodoForm from "~/components/EditTodoForm";
import Footer from "~/components/Footer";
import PomodoroTimers from "~/components/PomodoroTimers";
import TodoAnalytics from "~/components/TodoAnalytics";
import TodoCombobox from "~/components/TodoCombobox";
import TodoForm from "~/components/TodoForm";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import WelcomePage from "~/components/WelcomePage";
import { api } from "~/utils/api";

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  const [homeTab, setHomeTab] = useState<"task" | "analytics">("task");
  const [enableTimer, setEnableTimer] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<{
    value: string;
    label: string;
  }>({ value: "", label: "" });
  const [fullTodo, setFullTodo] = useState<{
    id: string;
    createdAt: Date;
    title: string;
    description: string | null | undefined;
    done: boolean;
    dueDate: Date | null | undefined;
    priority: string | null | undefined;
    tomatoes: number;
    authorId: string;
  }>({
    id: "",
    createdAt: new Date(),
    title: "",
    description: "",
    done: false,
    dueDate: new Date(),
    priority: "",
    tomatoes: 0,
    authorId: "",
  });

  // API queries
  api.todo.getAll.useQuery(undefined, {
    enabled: userLoaded && !!isSignedIn,
  });

  const selectedTodoQuery = api.todo.getSelectedTodo.useQuery(
    { todoId: selectedTodo.value },
    {
      enabled: userLoaded && !!isSignedIn && selectedTodo.value !== "",
      onSuccess(data) {
        if (data) {
          setFullTodo(data);
        } else if (selectedTodo.value !== "") {
          setSelectedTodo({ value: "", label: "" });
          setFullTodo({
            id: "",
            createdAt: new Date(),
            title: "",
            description: "",
            done: false,
            dueDate: new Date(),
            priority: "",
            tomatoes: 0,
            authorId: "",
          });
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("selectedTodo");
          }
        }
      },
    }
  );

  useEffect(() => {
    if (selectedTodo.value === "") {
      setFullTodo({
        id: "",
        createdAt: new Date(),
        title: "",
        description: "",
        done: false,
        dueDate: new Date(),
        priority: "",
        tomatoes: 0,
        authorId: "",
      });
    }
  }, [selectedTodo.value]);

  useEffect(() => {
    if (selectedTodo.value !== "") {
      setEnableTimer(!fullTodo.done);
    } else {
      setEnableTimer(false);
    }
  }, [selectedTodo.value, fullTodo.done]);

  // Persist selected tab across visits
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("homeTab");
    if (saved === "task" || saved === "analytics") {
      setHomeTab(saved);
    }
    const savedTodo = window.localStorage.getItem("selectedTodo");
    if (savedTodo) {
      try {
        const parsed = JSON.parse(savedTodo) as { value: string; label: string };
        setSelectedTodo(parsed);
      } catch { }
    }
  }, []);

  if (!userLoaded) return <div />;

  return (
    <div className={isSignedIn
      ? "flex min-h-full flex-col md:h-full md:overflow-hidden"
      : "flex flex-col md:h-full md:overflow-auto"
    }>
      <Head>
        <title>PomodoroTodo</title>
        <meta
          name="description"
          content="A Pomodoro-Todo application built with Next.js, Clerk, Prisma, Tailwind CSS, tRPC +more"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!isSignedIn ? (
        <>
          <WelcomePage />
          <Footer />
        </>
      ) : (
        <main className="mx-auto flex w-full max-w-screen-2xl 2xl:max-w-none flex-1 md:min-h-0 flex-col gap-4 p-2 md:flex-row md:p-4 md:overflow-hidden">
          <div className="bg-gradient-to-br from-[#2e325a] to-[#0ea5e9] p-5 text-white md:w-[480px] md:min-w-[480px] md:flex-shrink-0 md:p-10 md:rounded-lg md:h-full md:overflow-hidden overflow-y-auto border-r border-white/10">
            <div className="flex space-x-2">
              <TodoForm />
              <TodoCombobox
                selectedTodo={selectedTodo}
                setSelectedTodo={(v) => {
                  setSelectedTodo(v);
                  if (typeof window !== "undefined") {
                    try {
                      window.localStorage.setItem("selectedTodo", JSON.stringify(v));
                    } catch { }
                  }
                }}
              />
            </div>
            <TodoAnalytics
              fullTodo={fullTodo}
              showTodoDetailsSkeleton={
                selectedTodo.value !== "" &&
                selectedTodoQuery.isLoading &&
                fullTodo.id === ""
              }
            />
          </div>

          <div className="flex-1 flex flex-col md:h-full min-h-0">
            <Tabs
              value={homeTab}
              onValueChange={(v) => {
                setHomeTab(v as typeof homeTab);
                if (typeof window !== "undefined") window.localStorage.setItem("homeTab", v);
              }}
              className="flex flex-col flex-1 min-h-0 w-full"
            >
              <TabsList className="grid w-full grid-cols-2 shrink-0">
                <TabsTrigger value="task">Task</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <div className="mt-2 flex flex-1 flex-col min-h-0">
                <TabsContent value="task" className="mt-0 flex-1 flex min-h-0 flex-col overflow-y-auto [&:not([data-state=active])]:hidden [&[data-state=active]]:flex">
                  <Card className="bg-muted flex-1 flex flex-col min-h-0">
                    <CardContent className="flex flex-1 w-full flex-col space-y-2 p-2">
                      {fullTodo.id !== "" && <EditTodoForm fullTodo={fullTodo} />}
                      <PomodoroTimers
                        enableTimer={enableTimer}
                        selectedTodo={selectedTodo}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="mt-0 flex-1 flex flex-col min-h-0 [&:not([data-state=active])]:hidden [&[data-state=active]]:flex">
                  <Card className="bg-muted flex min-h-0 w-full flex-1 flex-col">
                    <CardContent className="flex min-h-0 w-full flex-1 p-2">
                      <AnalyticsDashboard />
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>
      )}
    </div>
  );
}