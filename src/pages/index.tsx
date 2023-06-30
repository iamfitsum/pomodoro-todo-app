import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import PomodoroTimers from "~/components/PomodoroTimers";
import WelcomePage from "~/components/WelcomePage";
import TodoForm from "~/components/TodoForm";
import TodoCombobox from "~/components/TodoCombobox";
import { api } from "~/utils/api";
import { useState } from "react";
import SelectedTodoAnalytics from "~/components/SelectedTodoAnalytics";

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  const [selectedTodo, setSelectedTodo] = useState<{
    value: string;
    label: string;
  }>({ value: "", label: "" });
  const [fullTodo, setFullTodo] = useState<
  | {
    id: string;
    createdAt: Date;
    title: string;
    description: string | null;
    done: boolean;
    dueDate: Date | null;
    priority: string | null;
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

  api.todo.getAll.useQuery();
  api.todo.getSelectedTodo.useQuery({ todoId: selectedTodo.value });

  const getFullTodo = api.todo.getSelectedTodo.useQuery(
    { todoId: selectedTodo.value },
    {
      onSuccess(data) {
        if(data){

          setFullTodo(data);
        }
      },
    }
  );

  if (!userLoaded || !getFullTodo) return <div />;
  return (
    <>
      <Head>
        <title>PomodoroTodo</title>
        <meta
          name="description"
          content="A Pomodoro-Todo application built with Next.js, Clerk, Prisma, Tailwind CSS, tRPC +more"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!isSignedIn && <WelcomePage />}
      {isSignedIn && (
        <main className="flex min-h-screen flex-col md:flex-row">
          <div className="bg-gradient-to-br from-[#2e325a] to-[#0ea5e9] p-10 text-white md:max-w-lg">
            <div className="flex space-x-2">
              <TodoForm />
              <TodoCombobox
                selectedTodo={selectedTodo}
                setSelectedTodo={setSelectedTodo}
              />
            </div>
            <hr className="my-10" />
            <div className="mb-5 mt-5 flex items-center justify-between space-x-10">
              <div>
                <p className="text-xl">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>

                <p className="font-extralight">
                  Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </p>
              </div>

              <p className="text-xl font-bold uppercase">
                {new Date().toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
              </p>
            </div>
            <hr className="my-10" />

            <SelectedTodoAnalytics fullTodo={fullTodo} />
            {/* <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-muted-foreground text-xs">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card> */}
          </div>
          <div className="flex-1 p-2">
            <Tabs defaultValue="task" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="task">Task</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="task">
                <Card className="bg-muted">
                  <CardContent className="w-full p-2">
                    <PomodoroTimers />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="analytics">
                <Card className="bg-muted">
                  <CardContent className="space-y-2"></CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      )}
    </>
  );
}
