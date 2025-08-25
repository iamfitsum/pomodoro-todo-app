import { Info, PauseCircle, PlayCircle, RotateCw, XCircle } from "lucide-react";
import { useContext, useEffect, useRef } from "react";
import TimerDial from "~/components/TimerDial";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import TimerContext, { TimerVariants } from "~/state/timer/TimerContext";
import { computeResumeDeadlineMs } from "~/utils/utils";

type Props = {
  enableTimer: boolean;
  selectedTodo: {
    value: string;
    label: string;
  };
};

const PomodoroTimers = ({ enableTimer, selectedTodo }: Props) => {
  const {
    activeTimer,
    setActiveTimer,
    setTimeRemaining,
    timeRemaining,
    timerDurations,
    paused,
    setPaused,
    deadlineMs,
    setDeadlineMs,
  } = useContext(TimerContext);

  const timeDuration = timerDurations[activeTimer];
  const secTimeRemaining = timeRemaining;

  const prevSelectedRef = useRef<typeof selectedTodo | null>(null);
  useEffect(() => {
    // Skip first run to avoid resetting after restoring from localStorage
    if (prevSelectedRef.current === null) {
      prevSelectedRef.current = selectedTodo;
      return;
    }
    // If we are transitioning from empty -> persisted value on first hydration, don't reset
    if (
      prevSelectedRef.current.value === "" &&
      selectedTodo.value !== ""
    ) {
      prevSelectedRef.current = selectedTodo;
      return;
    }
    if (prevSelectedRef.current.value !== selectedTodo.value) {
      setTimeRemaining(timerDurations.pomodoro);
      setActiveTimer(TimerVariants.POMODORO);
      setPaused(true);
      setDeadlineMs(null);
      prevSelectedRef.current = selectedTodo;
    }
  }, [
    selectedTodo,
    setTimeRemaining,
    setActiveTimer,
    setPaused,
    timerDurations.pomodoro,
    setDeadlineMs,
  ]);

  // If we restored an unpaused timer with deadlineMs, ensure play resumes on mount
  useEffect(() => {
    if (!paused && timeRemaining > 0) {
      // ensure deadline exists when resuming from legacy state
      setDeadlineMs(deadlineMs ?? Date.now() + timeRemaining * 1000);
    }
    // run once after mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!enableTimer) return;
      if (e.code === "Space") {
        e.preventDefault();
        setPaused(!paused);
      }
      if (e.key.toLowerCase() === "s") {
        setTimeRemaining(timeDuration);
        setPaused(true);
        setDeadlineMs(null);
      }
      if (e.key.toLowerCase() === "r") {
        setTimeRemaining(timeDuration);
        setPaused(false);
        setDeadlineMs(computeResumeDeadlineMs(timeDuration));
      }
      if (e.key === "1") {
        setTimeRemaining(timerDurations.pomodoro);
        setActiveTimer(TimerVariants.POMODORO);
        setPaused(true);
        setDeadlineMs(null);
      }
      if (e.key === "2") {
        setTimeRemaining(timerDurations.shortbreak);
        setActiveTimer(TimerVariants.SHORT);
        setPaused(true);
        setDeadlineMs(null);
      }
      if (e.key === "3") {
        setTimeRemaining(timerDurations.longbreak);
        setActiveTimer(TimerVariants.LONG);
        setPaused(true);
        setDeadlineMs(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enableTimer, paused, setPaused, setTimeRemaining, timeDuration, timerDurations, setActiveTimer, setDeadlineMs]);

  return (
    <div className="flex w-full flex-col items-center">
      <Tabs
        defaultValue="pomodoro"
        className="w-full"
        value={activeTimer.valueOf()}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="pomodoro"
            onClick={() => {
              setTimeRemaining(timerDurations.pomodoro);
              setActiveTimer(TimerVariants.POMODORO);
              setPaused(true);
              setDeadlineMs(null);
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
              setDeadlineMs(null);
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
              setDeadlineMs(null);
            }}
          >
            long break
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pomodoro">
          <Card className="bg-muted">
            <CardContent className="flex flex-col items-center gap-2 pt-4">
              {!enableTimer && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info size={16} />
                  <span>Select a todo to enable timer controls</span>
                </div>
              )}
              <div className="my-4">
                <TimerDial
                  timeRemaining={secTimeRemaining}
                  timeDuration={timeDuration}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-10 pb-6">
              <Button
                variant="ghost"
                className="w-fit rounded-lg"
                disabled={!enableTimer}
                onClick={() => {
                  setTimeRemaining(timeDuration);
                  setPaused(true);
                  setDeadlineMs(null);
                }}
              >
                <XCircle size={30} color="#0ea5e9" />
              </Button>
              <Button
                variant="ghost"
                className="w-fit rounded-lg"
                disabled={!enableTimer}
                onClick={() => {
                  const next = !paused;
                  setPaused(next);
                  if (next) setDeadlineMs(null);
                  else setDeadlineMs(computeResumeDeadlineMs(timeRemaining));
                }}
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
                disabled={!enableTimer}
                onClick={() => {
                  setTimeRemaining(timeDuration);
                  setPaused(false);
                  setDeadlineMs(computeResumeDeadlineMs(timeDuration));
                }}
              >
                <RotateCw size={25} color="#0ea5e9" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="shortbreak">
          <Card className="bg-muted">
            <CardContent className="flex flex-col items-center gap-2 pt-4">
              {!enableTimer && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info size={16} />
                  <span>Select a todo to enable timer controls</span>
                </div>
              )}
              <div className="my-4">
                <TimerDial
                  timeRemaining={secTimeRemaining}
                  timeDuration={timeDuration}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-10 pb-6">
              <Button
                variant="ghost"
                className="w-fit rounded-lg"
                disabled={!enableTimer}
                onClick={() => {
                  setTimeRemaining(timeDuration);
                  setPaused(true);
                  setDeadlineMs(null);
                }}
              >
                <XCircle size={30} color="#0ea5e9" />
              </Button>
              <Button
                variant="ghost"
                className="w-fit rounded-lg"
                disabled={!enableTimer}
                onClick={() => {
                  const next = !paused;
                  setPaused(next);
                  if (next) setDeadlineMs(null);
                  else setDeadlineMs(computeResumeDeadlineMs(timeRemaining));
                }}
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
                disabled={!enableTimer}
                onClick={() => {
                  setTimeRemaining(timeDuration);
                  setPaused(false);
                  setDeadlineMs(computeResumeDeadlineMs(timeDuration));
                }}
              >
                <RotateCw size={25} color="#0ea5e9" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="longbreak">
          <Card className="bg-muted">
            <CardContent className="flex flex-col items-center gap-2 pt-4">
              {!enableTimer && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info size={16} />
                  <span>Select a todo to enable timer controls</span>
                </div>
              )}
              <div className="my-4">
                <TimerDial
                  timeRemaining={secTimeRemaining}
                  timeDuration={timeDuration}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-10 pb-6">
              <Button
                variant="ghost"
                className="w-fit rounded-lg"
                disabled={!enableTimer}
                onClick={() => {
                  setTimeRemaining(timeDuration);
                  setPaused(true);
                  setDeadlineMs(null);
                }}
              >
                <XCircle size={30} color="#0ea5e9" />
              </Button>
              <Button
                variant="ghost"
                className="w-fit rounded-lg"
                disabled={!enableTimer}
                onClick={() => {
                  const next = !paused;
                  setPaused(next);
                  if (next) {
                    setDeadlineMs(null);
                  } else {
                    setDeadlineMs(Date.now() + timeRemaining * 1000);
                  }
                }}
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
                disabled={!enableTimer}
                onClick={() => {
                  setTimeRemaining(timeDuration);
                  setPaused(false);
                  setDeadlineMs(Date.now() + timeDuration * 1000);
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
