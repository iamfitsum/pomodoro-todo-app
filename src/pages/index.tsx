import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import EditTodoForm from "~/components/EditTodoForm";
import Footer from "~/components/Footer";
import PomodoroTimers from "~/components/PomodoroTimers";
import TodoAnalytics from "~/components/TodoAnalytics";
import TodoCombobox from "~/components/TodoCombobox";
import TodoForm from "~/components/TodoForm";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import WelcomePage from "~/components/WelcomePage";
import { api } from "~/utils/api";

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

  const [doneTodosByMonth, setDoneTodosByMonth] = useState<
    { name: string; total: number; }[] | undefined
  >(undefined);

  const [undoneTodosByMonth, setUndoneTodosByMonth] = useState<
    { name: string; total: number; }[] | undefined
  >(undefined);

  // API queries
  api.todo.getAll.useQuery();

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

  api.todo.doneTodosByMonth.useQuery(undefined, {
    onSuccess(data) {
      const doneTodosByMonthData = data.map((analytics) => ({
        name: analytics.name.substring(0, 3),
        total: analytics.total,
      }));
      setDoneTodosByMonth([...new Set(doneTodosByMonthData)]);
    },
  });

  api.todo.undoneTodosByMonth.useQuery(undefined, {
    onSuccess(data) {
      const undoneTodosByMonthData = data.map((analytics) => ({
        name: analytics.name.substring(0, 3),
        total: analytics.total,
      }));
      setUndoneTodosByMonth([...new Set(undoneTodosByMonthData)]);
    },
  });

  useEffect(() => {
    if (selectedTodo.value !== "") {
      setEnableTimer(!fullTodo.done);
    } else {
      setEnableTimer(false);
    }
  }, [selectedTodo, getFullTodo, fullTodo.done]);

  if (!userLoaded) return <div />;

  return (
    <div className="flex min-h-screen flex-col">
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
        <WelcomePage />
      ) : (
        <>
          <main className="flex flex-1 flex-col md:flex-row">
            <div className="bg-gradient-to-br from-[#2e325a] to-[#0ea5e9] p-5 text-white md:max-w-lg md:p-10">
              <div className="flex space-x-2">
                <TodoForm />
                <TodoCombobox
                  selectedTodo={selectedTodo}
                  setSelectedTodo={setSelectedTodo}
                />
              </div>
              <TodoAnalytics fullTodo={fullTodo} />
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
                      {fullTodo.id !== "" && <EditTodoForm fullTodo={fullTodo} />}
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
                      <AnalyticsChart
                        title="Done Todos By Month"
                        data={doneTodosByMonth}
                      />
                      <AnalyticsChart
                        title="Undone Todos By Month"
                        data={undoneTodosByMonth}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </>
      )}
      <Footer />
    </div>
  );
}

function AnalyticsChart({ title, data }: { title: string; data: { name: string; total: number; }[] | undefined }) {
  return (
    <Card className="bg-muted">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
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
  );
}