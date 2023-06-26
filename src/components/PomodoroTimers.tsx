import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { PauseCircle, RotateCw, XCircle } from "lucide-react";
import { useContext } from "react";
import TimerContext, { TimerVariants } from "~/state/timer/TimerContext";
import TimerDial from "~/components/TimerDial";
import { PlayCircle } from "lucide-react";


const PomodoroTimers = () => {
  const {
    activeTimer,
    setActiveTimer,
    setTimeRemaining,
    timeRemaining,
    timerDurations,
    paused,
    setPaused,
  } = useContext(TimerContext);
  const timeDuration = timerDurations[activeTimer];
  const secTimeRemaining = timeRemaining;
  return (
    <div className="flex flex-col h-screen w-full items-center justify-center">
      <Tabs defaultValue="pomodoro" className="w-full md:w-2/5">
        <TabsList  className="grid w-full grid-cols-3">
          <TabsTrigger
            value="pomodoro"
            onClick={() => {
              setTimeRemaining(timerDurations.pomodoro);
              setActiveTimer(TimerVariants.POMODORO);
              setPaused(true);
            }}
          >
            pomodoro
          </TabsTrigger>
          <TabsTrigger
            value="shortbreak"
            onClick={() => {
              setTimeRemaining(timerDurations.shortbreak);
              setActiveTimer(TimerVariants.SHORT);
              setPaused(true);
            }}
          >
            short break
          </TabsTrigger>
          <TabsTrigger
            value="longbreak"
            onClick={() => {
              setTimeRemaining(timerDurations.longbreak);
              setActiveTimer(TimerVariants.LONG);
              setPaused(true);
            }}
          >
            long break
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pomodoro">
          <Card className="bg-muted">
            <CardContent className="flex justify-center space-y-2">
              <div className="my-4">
                <TimerDial
                  timeRemaining={secTimeRemaining}
                  timeDuration={timeDuration}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-center space-x-20 ">
              <Button
                variant="ghost"
                className="w-fit rounded-lg"
                onClick={() => {
                  setTimeRemaining(timeDuration);
                  setPaused(true);
                }}
              >
                <XCircle size={30} color="#0ea5e9" />
              </Button>
              <Button
                variant="ghost"
                className="w-fit rounded-lg"
                onClick={() => setPaused(!paused)}
              >
                {paused ? (
                  <PlayCircle size={30} color="#0ea5e9" />
                ) : (
                  <PauseCircle size={30} color="#0ea5e9" />
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-fit rounded-lg"
                onClick={() => {
                  setTimeRemaining(timeDuration);
                  setPaused(false);
                }}
              >
                <RotateCw size={25} color="#0ea5e9" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="shortbreak">
          <Card className="bg-muted">
            <CardContent className="flex justify-center space-y-2">
              <div className="my-4">
                <TimerDial
                  timeRemaining={secTimeRemaining}
                  timeDuration={timeDuration}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-center space-x-20 ">
              <Button
                variant="ghost"
                className="w-fit rounded-lg"
                onClick={() => {
                  setTimeRemaining(timeDuration);
                  setPaused(true);
                }}
              >
                <XCircle size={30} color="#0ea5e9" />
              </Button>
              <Button
                variant="ghost"
                className="w-fit rounded-lg"
                onClick={() => setPaused(!paused)}
              >
                {paused ? (
                  <PlayCircle size={30} color="#0ea5e9" />
                ) : (
                  <PauseCircle size={30} color="#0ea5e9" />
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-fit rounded-lg"
                onClick={() => {
                  setTimeRemaining(timeDuration);
                  setPaused(false);
                }}
              >
                <RotateCw size={25} color="#0ea5e9" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="longbreak">
          <Card className="bg-muted">
            <CardContent className="flex justify-center space-y-2">
              <div className="my-4">
                <TimerDial
                  timeRemaining={secTimeRemaining}
                  timeDuration={timeDuration}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-center space-x-20 ">
              <Button
                variant="ghost"
                className="w-fit rounded-lg"
                onClick={() => {
                  setTimeRemaining(timeDuration);
                  setPaused(true);
                }}
              >
                <XCircle size={30} color="#0ea5e9" />
              </Button>
              <Button
                variant="ghost"
                className="w-fit rounded-lg"
                onClick={() => setPaused(!paused)}
              >
                {paused ? (
                  <PlayCircle size={30} color="#0ea5e9" />
                ) : (
                  <PauseCircle size={30} color="#0ea5e9" />
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-fit rounded-lg"
                onClick={() => {
                  setTimeRemaining(timeDuration);
                  setPaused(false);
                }}
              >
                <RotateCw size={25} color="#0ea5e9" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PomodoroTimers;
