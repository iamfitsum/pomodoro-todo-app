import { createContext, type PropsWithChildren, useEffect, useState } from "react";

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

  deadlineMs: number | null;
  setDeadlineMs: (d: number | null) => void;
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

  timeRemaining: 25 * 60,
  setTimeRemaining: (t: number) => undefined,

  timerDurations: {
    pomodoro: 25 * 60,
    shortbreak: 5 * 60,
    longbreak: 15 * 60,
  },
  setTimerDuration: (td: TimerDurations) => undefined,

  deadlineMs: null,
  setDeadlineMs: (d: number | null) => undefined,
};

const TimerContext = createContext<ITimerContext>(defaultValue);

export const TimerProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // Hydrate initial state synchronously from localStorage to avoid a write-before-read race
  const loadInitial = () => {
    if (typeof window === "undefined") {
      return {
        activeTimer: defaultValue.activeTimer,
        paused: defaultValue.paused,
        isPomodoroFinished: defaultValue.isPomodoroFinished,
        completedTomatoes: defaultValue.completedTomatoes,
        timerDurations: defaultValue.timerDurations,
        timeRemaining: defaultValue.timerDurations[defaultValue.activeTimer],
        deadlineMs: defaultValue.deadlineMs,
      };
    }
    try {
      const raw = window.localStorage.getItem("timerState");
      if (!raw) {
        return {
          activeTimer: defaultValue.activeTimer,
          paused: defaultValue.paused,
          isPomodoroFinished: defaultValue.isPomodoroFinished,
          completedTomatoes: defaultValue.completedTomatoes,
          timerDurations: defaultValue.timerDurations,
          timeRemaining: defaultValue.timerDurations[defaultValue.activeTimer],
          deadlineMs: defaultValue.deadlineMs,
        };
      }
      const saved = JSON.parse(raw) as Partial<ITimerContext> & {
        timeRemaining?: number;
        timerDurations?: TimerDurations;
        deadlineMs?: number | null;
      };
      const activeTimer = saved.activeTimer ?? defaultValue.activeTimer;
      const paused = typeof saved.paused === "boolean" ? saved.paused : defaultValue.paused;
      const isPomodoroFinished = typeof saved.isPomodoroFinished === "boolean" ? saved.isPomodoroFinished : defaultValue.isPomodoroFinished;
      const completedTomatoes = typeof saved.completedTomatoes === "number" ? saved.completedTomatoes : defaultValue.completedTomatoes;
      const timerDurations = saved.timerDurations ?? defaultValue.timerDurations;
      let deadlineMs = typeof saved.deadlineMs === "number" ? saved.deadlineMs : null;
      let timeRemaining: number;
      if (deadlineMs && !paused) {
        timeRemaining = Math.max(0, Math.round((deadlineMs - Date.now()) / 1000));
      } else if (typeof saved.timeRemaining === "number") {
        timeRemaining = saved.timeRemaining;
        if (!paused) {
          deadlineMs = Date.now() + saved.timeRemaining * 1000;
        }
      } else {
        timeRemaining = timerDurations[activeTimer];
      }
      return { activeTimer, paused, isPomodoroFinished, completedTomatoes, timerDurations, timeRemaining, deadlineMs };
    } catch {
      return {
        activeTimer: defaultValue.activeTimer,
        paused: defaultValue.paused,
        isPomodoroFinished: defaultValue.isPomodoroFinished,
        completedTomatoes: defaultValue.completedTomatoes,
        timerDurations: defaultValue.timerDurations,
        timeRemaining: defaultValue.timerDurations[defaultValue.activeTimer],
        deadlineMs: defaultValue.deadlineMs,
      };
    }
  };

  const initial = loadInitial();
  const [activeTimer, setActiveTimer] = useState(initial.activeTimer);
  const [paused, setPaused] = useState(initial.paused);
  const [isPomodoroFinished, setIsPomodoroFinished] = useState(initial.isPomodoroFinished);
  const [completedTomatoes, setCompletedTomatoes] = useState(initial.completedTomatoes);
  const [timerDurations, setTimerDuration] = useState(initial.timerDurations);
  const [timeRemaining, setTimeRemaining] = useState(initial.timeRemaining);
  const [deadlineMs, setDeadlineMs] = useState<number | null>(initial.deadlineMs);

  // Persist timer state
  useEffect(() => {
    if (typeof window === "undefined") return;
    const state = {
      activeTimer,
      paused,
      isPomodoroFinished,
      completedTomatoes,
      timeRemaining,
      timerDurations,
      deadlineMs,
    };
    try {
      window.localStorage.setItem("timerState", JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [activeTimer, paused, isPomodoroFinished, completedTomatoes, timeRemaining, timerDurations, deadlineMs]);

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
        deadlineMs,
        setDeadlineMs,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export default TimerContext;
