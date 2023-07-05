import { createContext, type PropsWithChildren, useState } from "react";

export enum TimerVariants {
  POMODORO = "pomodoro",
  SHORT = "shortbreak",
  LONG = "longbreak",
}

export type TimerDurations = Record<TimerVariants, number>;

type ITimerContext = {
  activeTimer: TimerVariants;
  setActiveTimer: (variant: TimerVariants) => void;

  paused: boolean;
  setPaused: (p: boolean) => void;

  isPomodoroFinished: boolean;
  setIsPomodoroFinished: (f: boolean) => void;

  completedTomatoes: number;
  setCompletedTomatoes: (t: number) => void;

  timeRemaining: number;
  setTimeRemaining: (t: number) => void;

  timerDurations: TimerDurations;
  setTimerDuration: (td: TimerDurations) => void;
};

const defaultValue: ITimerContext = {
  activeTimer: TimerVariants.POMODORO,
  setActiveTimer: (variant: TimerVariants) => undefined,

  paused: true,
  setPaused: (p: boolean) => undefined,

  isPomodoroFinished: false,
  setIsPomodoroFinished: (f: boolean) => undefined,

  completedTomatoes: 0,
  setCompletedTomatoes: (t: number) => undefined,

  timeRemaining: 0,
  setTimeRemaining: (t: number) => undefined,

  timerDurations: {
    pomodoro: 25,
    shortbreak: 5,
    longbreak: 15,
  },
  setTimerDuration: (td: TimerDurations) => undefined,
};

const TimerContext = createContext<ITimerContext>(defaultValue);

export const TimerProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [activeTimer, setActiveTimer] = useState(defaultValue.activeTimer);
  const [paused, setPaused] = useState(defaultValue.paused);
  const [isPomodoroFinished, setIsPomodoroFinished] = useState(defaultValue.isPomodoroFinished);
  const [completedTomatoes, setCompletedTomatoes] = useState(
    defaultValue.completedTomatoes
  );
  const [timerDurations, setTimerDuration] = useState(
    defaultValue.timerDurations
  );

  const defaultTimeRemaining =
    defaultValue.timerDurations[defaultValue.activeTimer];
  const [timeRemaining, setTimeRemaining] = useState(defaultTimeRemaining);

  return (
    <TimerContext.Provider
      value={{
        activeTimer,
        setActiveTimer,
        paused,
        setPaused,
        isPomodoroFinished,
        setIsPomodoroFinished,
        timeRemaining,
        setTimeRemaining,
        timerDurations,
        setTimerDuration,
        completedTomatoes,
        setCompletedTomatoes,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export default TimerContext;
