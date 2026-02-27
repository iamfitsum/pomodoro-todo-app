import { Apple, CircleIcon, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/utils/api";
import { cn } from "~/utils/utils";

const getMinuteFromNumber = (num: number) => {
  const minutes = num * 25;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = remainingMinutes.toString().padStart(2, "0");
  return `${formattedHours}:${formattedMinutes}`;
};

type Props = {
  fullTodo: {
    id: string;
    createdAt: Date;
    title: string;
    description: string | null | undefined;
    done: boolean;
    dueDate: Date | null | undefined;
    priority: string | null | undefined;
    tomatoes: number;
    authorId: string;
  };
  showTodoDetailsSkeleton?: boolean;
};

const TodoAnalytics = ({ fullTodo, showTodoDetailsSkeleton = false }: Props) => {
  const [now, setNow] = useState(() => new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const { data: streakData, isLoading: isStreakLoading } =
    api.todo.streakHeatmap.useQuery();
  const { data: totalTomatoesData, isLoading: isTotalTomatoesLoading } =
    api.todo.getTotalTomatoes.useQuery();
  const totalTomatoes = totalTomatoesData?.totalTomatoes ?? 0;

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);
  return (
    <>
      {showTodoDetailsSkeleton && (
        <Card className="mt-2">
          <CardHeader>
            <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </CardHeader>
          <CardContent>
            <div className="flex space-x-3 text-xs md:space-x-4 md:text-sm">
              <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-10 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </CardContent>
        </Card>
      )}
      {fullTodo.id !== "" && !showTodoDetailsSkeleton && (
        <Card className="mt-2">
          <CardHeader>
            <CardDescription className="text-[#0ea5e9] dark:text-[#0ea5e9] break-words leading-snug">
              {fullTodo.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground flex space-x-3 text-xs md:space-x-4 md:text-sm text-[#0ea5e9]">
              <div className="flex items-center">
                <CircleIcon
                  className={cn(
                    fullTodo.priority === "LOW" && "text-green-500",
                    fullTodo.priority === "MEDIUM" && "text-yellow-500",
                    fullTodo.priority === "HIGH" && "text-red-500",
                    "mr-1 h-3 w-3 "
                  )}
                />
                {fullTodo.priority}
              </div>
              <div className="flex items-center">
                <Apple className="mr-1 h-3 w-3" />
                {fullTodo.tomatoes}
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                {getMinuteFromNumber(fullTodo.tomatoes)}
              </div>
              <div>
                Due{" "}
                {fullTodo.dueDate?.toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <hr className="my-5 md:my-10" />
      <div className="mb-5 mt-5 flex items-center justify-between space-x-10">
        <div>
          <p className="text-xl">
            {now.toLocaleDateString("en-US", {
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
          {now.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })}
        </p>
      </div>
      <hr className="my-5 md:my-10" />
      <div className="flex w-full justify-between space-x-2">
        <Card className="w-1/2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#0ea5e9]">
              Tomato
            </CardTitle>
            <Apple className="text-muted-foreground h-4 w-4 text-[#0ea5e9]" />
          </CardHeader>
          <CardContent>
            {isTotalTomatoesLoading ? (
              <div className="mx-auto h-8 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            ) : (
              <div className="text-center text-2xl font-bold text-[#0ea5e9]">
                {totalTomatoes}
              </div>
            )}
            <p className="text-muted-foreground text-center text-xs text-[#0ea5e9]">
              total focus sessions
            </p>
          </CardContent>
        </Card>
        <Card className="w-1/2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#0ea5e9]">
              Focus Time
            </CardTitle>
            <Clock className="text-muted-foreground h-4 w-4 text-[#0ea5e9]" />
          </CardHeader>
          <CardContent>
            {isTotalTomatoesLoading ? (
              <div className="mx-auto h-8 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            ) : (
              <div className="text-center text-2xl font-bold text-[#0ea5e9]">
                {getMinuteFromNumber(totalTomatoes)}
              </div>
            )}
            <p className="text-muted-foreground text-center text-xs text-[#0ea5e9]">
              total focus time
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-[#0ea5e9]">
            Streak
          </CardTitle>
          {isStreakLoading ? (
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          ) : (
            <CardDescription className="text-[#0ea5e9]">
              {streakData?.currentStreak ?? 0} day streak ·{" "}
              {streakData?.totalActiveDays ?? 0}/35 active days
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {isStreakLoading &&
              Array.from({ length: 35 }).map((_, index) => (
                <div
                  key={`streak-skeleton-${index}`}
                  className="h-3 w-full animate-pulse rounded-[2px] bg-slate-200 dark:bg-slate-800"
                />
              ))}
            {!isStreakLoading &&
              streakData?.days.map((day) => {
              const levelClass =
                day.intensity === 0
                  ? "bg-slate-200 dark:bg-slate-800"
                  : day.intensity === 1
                    ? "bg-sky-200 dark:bg-sky-700"
                    : day.intensity === 2
                      ? "bg-sky-300 dark:bg-sky-600"
                      : day.intensity === 3
                        ? "bg-sky-500 dark:bg-sky-500"
                        : "bg-sky-700 dark:bg-sky-400";

              return (
                <div
                  key={day.date}
                  className="relative"
                  onMouseEnter={() => setHoveredDate(day.date)}
                  onMouseLeave={() => setHoveredDate(null)}
                >
                  <div
                    className={cn(
                      "h-3 w-full rounded-[2px] transition-transform duration-150 hover:scale-110",
                      "ring-1 ring-transparent hover:ring-sky-400/70",
                      levelClass
                    )}
                  />
                  {hoveredDate === day.date && (
                    <div className="pointer-events-none absolute -top-12 left-1/2 z-20 min-w-[9rem] -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-xl dark:border-slate-800 dark:bg-slate-950">
                      <div className="text-slate-600 dark:text-slate-300">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-sky-500" />
                          <span className="text-slate-600 dark:text-slate-300">
                            Tomatoes
                          </span>
                        </div>
                        <span className="font-medium tabular-nums text-slate-900 dark:text-slate-50">
                          {day.count}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TodoAnalytics;
