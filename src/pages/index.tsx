import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import PomodoroTimers from "~/components/PomodoroTimers";
import WelcomePage from "~/components/WelcomePage";
import TodoForm from "~/components/TodoForm";
import TodoCombobox from "~/components/TodoCombobox";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";
import SelectedTodoAnalytics from "~/components/SelectedTodoAnalytics";
import EditTodoForm from "~/components/EditTodoForm";

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
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

  api.todo.getAll.useQuery();
  api.todo.getSelectedTodo.useQuery({ todoId: selectedTodo.value });
  api.todo.doneTodosByMonth.useQuery();

  const [doneTodosByMonth, setDoneTodosByMonth] = useState<
    | {
        name: string;
        total: number;
      }[]
    | undefined
  >(undefined);

  const [undoneTodosByMonth, setUndoneTodosByMonth] = useState<
    | {
        name: string;
        total: number;
      }[]
    | undefined
  >(undefined);

  api.todo.doneTodosByMonth.useQuery(undefined, {
    onSuccess(data) {
      const doneTodosByMonthData = data.map((analytics) => {
        return {
          name: analytics.name.substring(0, 3),
          total: analytics.total,
        };
      });
      setDoneTodosByMonth([...new Set(doneTodosByMonthData)]);
    },
  });

  api.todo.undoneTodosByMonth.useQuery(undefined, {
    onSuccess(data) {
      const undoneTodosByMonthData = data.map((analytics) => {
        return {
          name: analytics.name.substring(0,3),
          total: analytics.total,
        };
      });
      setUndoneTodosByMonth([...new Set(undoneTodosByMonthData)]);
    },
  });

  const getFullTodo = api.todo.getSelectedTodo.useQuery(
    { todoId: selectedTodo.value },
    {
      onSuccess(data) {
        if (data) {
          setFullTodo(data);
        }
      },
    }
  );

  

  useEffect(() => {
    if (selectedTodo.value !== "") {
      setEnableTimer(true);
    } else if (selectedTodo.value === "") {
      setEnableTimer(false);
    }
  }, [selectedTodo, getFullTodo]);

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
          <div className="bg-gradient-to-br from-[#2e325a] to-[#0ea5e9] p-5 text-white md:max-w-lg md:p-10">
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

            <SelectedTodoAnalytics
              fullTodo={fullTodo}
              enableTimer={enableTimer}
            />
          </div>
          <div className="flex-1 p-2">
            <Tabs defaultValue="task" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="task">Task</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="task">
                <Card className="bg-muted">
                  <CardContent className="w-full space-y-2 p-2">
                    {fullTodo.id !== "" && (
                      <EditTodoForm
                        fullTodo={fullTodo}
                      />
                    )}
                    <PomodoroTimers
                      enableTimer={enableTimer}
                      selectedTodo={selectedTodo}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="analytics">
                <Card className="bg-muted">
                  <CardContent className="w-full space-y-2 p-2">
                    <Card className="bg-muted">
                      <CardHeader>
                        <CardTitle>Done Todos By Month</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart data={doneTodosByMonth}>
                            <XAxis
                              dataKey="name"
                              stroke="#888888"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              stroke="#888888"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                            />
                            <Bar
                              dataKey="total"
                              fill="#0ea5e9"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted">
                      <CardHeader>
                        <CardTitle>Undone Todos By Month</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart data={undoneTodosByMonth}>
                            <XAxis
                              dataKey="name"
                              stroke="#888888"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              stroke="#888888"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                            />
                            <Bar
                              dataKey="total"
                              fill="#0ea5e9"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      )}
    </>
  );
}
