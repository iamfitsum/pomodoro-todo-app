import { Apple, CircleIcon, Clock } from "lucide-react";
import { useState } from "react";
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
};

const TodoAnalytics = ({ fullTodo }: Props) => {
  const [totalTomatoes, setTotalTomatoes] = useState(0);
  api.todo.getTotalTomatoes.useQuery(undefined, {
    onSuccess(data) {
      if (data) {
        setTotalTomatoes(data.totalTomatoes);
      }
    },
  });
  return (
    <>
      {fullTodo.id !== "" && (
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
            <div className="text-center text-2xl font-bold text-[#0ea5e9]">
              {totalTomatoes}
            </div>
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
            <div className="text-center text-2xl font-bold text-[#0ea5e9]">
              {getMinuteFromNumber(totalTomatoes)}
            </div>
            <p className="text-muted-foreground text-center text-xs text-[#0ea5e9]">
              total focus time
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TodoAnalytics;
