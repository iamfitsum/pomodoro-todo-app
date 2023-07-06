import { api } from "~/utils/api";
import { Apple, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useState } from "react";

const getMinuteFromNumber = (num: number) => {
  const minutes = num * 25;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = remainingMinutes.toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes}`;
}

const TomatoTodoAnalytics = () => {
  const [totalTomatoes, setTotalTomatoes] = useState(0);
 api.todo.getTotalTomatoes.useQuery(undefined,
    {
      onSuccess(data) {
        if (data) {
          setTotalTomatoes(data.totalTomatoes);
        }
      },
    }
  );
  return (
    <>
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

export default TomatoTodoAnalytics;
