import { Apple, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

const getMinuteFromNumber = (num: number) => {
  const minutes = num * 25;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = remainingMinutes.toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes}`;
}

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
  enableTimer: boolean;
};

const SelectedTodoAnalytics = ({ fullTodo, enableTimer }: Props) => {
  return (
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
            {enableTimer&& fullTodo.tomatoes}
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
            {enableTimer && getMinuteFromNumber(fullTodo.tomatoes)}
          </div>
          <p className="text-muted-foreground text-center text-xs text-[#0ea5e9]">
            total focus time
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectedTodoAnalytics;
