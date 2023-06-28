import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import PomodoroTimers from "~/components/PomodoroTimers";
import WelcomePage from "~/components/WelcomePage";
import TodoForm from "~/components/TodoForm";

export default function Home() {
  // const { data } = api.todo.getAll.useQuery();
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  if (!userLoaded) return <div />;
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
            <TodoForm />
            <h1 className="text-2xl font-bold md:text-3xl">
              This is a todo title This is a todo title
            </h1>
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
