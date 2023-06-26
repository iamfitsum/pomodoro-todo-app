import { createContext, PropsWithChildren, useState } from "react";

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
        timeRemaining,
        setTimeRemaining,
        timerDurations,
        setTimerDuration,
      }}>
      {children}
    </TimerContext.Provider>
  );
};

export default TimerContext;
