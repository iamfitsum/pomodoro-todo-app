import { UserButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import PomodoroTimers from "~/components/PomodoroTimers";
import { api } from "~/utils/api";

export default function Home() {
  const { data } = api.todo.getAll.useQuery();

  return (
    <>
      <Head>
        <title>PomodoroTodo</title>
        <meta
          name="description"
          content="A Pomodoro-Todo application built using Next.js, Clerk, Prisma, Tailwind CSS, tRPC +more"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="">
        <PomodoroTimers/>
      </main>
    </>
  );
}
