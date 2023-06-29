import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import PomodoroTimers from "~/components/PomodoroTimers";
import WelcomePage from "~/components/WelcomePage";
import TodoForm from "~/components/TodoForm";
import TodoCombobox from "~/components/TodoCombobox";
import { api } from "~/utils/api";

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  api.todo.getAll.useQuery();

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
            <div className="flex space-x-2">
              <TodoForm />
              <TodoCombobox />
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

            <hr className="mb-5 mt-10" />
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
