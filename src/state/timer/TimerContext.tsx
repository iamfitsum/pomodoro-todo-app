import { createContext, type PropsWithChildren, useEffect, useState } from "react";
import { calculateRemainingTimeSeconds, computeResumeDeadlineMs } from "~/utils/utils";

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
  setActiveTimer: (_variant: TimerVariants) => undefined,

  paused: true,
  setPaused: (_p: boolean) => undefined,

  isPomodoroFinished: false,
  setIsPomodoroFinished: (_f: boolean) => undefined,

  completedTomatoes: 0,
  setCompletedTomatoes: (_t: number) => undefined,

  timeRemaining: 25 * 60,
  setTimeRemaining: (_t: number) => undefined,

  timerDurations: {
    pomodoro: 25 * 60,
    shortbreak: 5 * 60,
    longbreak: 15 * 60,
  },
  setTimerDuration: (_td: TimerDurations) => undefined,

  deadlineMs: null,
  setDeadlineMs: (_d: number | null) => undefined,
};

const TimerContext = createContext<ITimerContext>(defaultValue);

export const TimerProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const normalizeTimerVariant = (value: unknown): TimerVariants => {
    if (typeof value !== "string") return defaultValue.activeTimer;
    const normalized = value.toLowerCase().replace(/\s+/g, "");
    if (normalized === "pomodoro") return TimerVariants.POMODORO;
    if (normalized === "shortbreak") return TimerVariants.SHORT;
    if (normalized === "longbreak") return TimerVariants.LONG;
    return defaultValue.activeTimer;
  };

  const normalizeTimerDurations = (value: unknown): TimerDurations => {
    const durations = typeof value === "object" && value !== null
      ? (value as Partial<Record<string, number>>)
      : {};
    const pomodoro = typeof durations.pomodoro === "number" && durations.pomodoro > 0
      ? durations.pomodoro
      : defaultValue.timerDurations.pomodoro;
    const shortbreak = typeof durations.shortbreak === "number" && durations.shortbreak > 0
      ? durations.shortbreak
      : defaultValue.timerDurations.shortbreak;
    const longbreak = typeof durations.longbreak === "number" && durations.longbreak > 0
      ? durations.longbreak
      : defaultValue.timerDurations.longbreak;
    return { pomodoro, shortbreak, longbreak };
  };

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
      const activeTimer = normalizeTimerVariant(saved.activeTimer);
      const paused = typeof saved.paused === "boolean" ? saved.paused : defaultValue.paused;
      const isPomodoroFinished = typeof saved.isPomodoroFinished === "boolean" ? saved.isPomodoroFinished : defaultValue.isPomodoroFinished;
      const completedTomatoes = typeof saved.completedTomatoes === "number" ? saved.completedTomatoes : defaultValue.completedTomatoes;
      const timerDurations = normalizeTimerDurations(saved.timerDurations);
      let deadlineMs = typeof saved.deadlineMs === "number" ? saved.deadlineMs : null;
      let timeRemaining: number;
      if (deadlineMs && !paused) {
        timeRemaining = calculateRemainingTimeSeconds(deadlineMs);
      } else if (typeof saved.timeRemaining === "number") {
        timeRemaining = saved.timeRemaining;
        if (!paused) {
          deadlineMs = computeResumeDeadlineMs(saved.timeRemaining);
        } else {
          // If persisted state captured a just-finished phase as 0 while paused,
          // restore to the configured duration for the active timer.
          const duration = timerDurations[activeTimer];
          if (timeRemaining <= 0 || timeRemaining > duration) {
            timeRemaining = duration;
          }
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

  useEffect(() => {
    if (!paused || deadlineMs !== null) return;
    const duration = timerDurations[activeTimer];
    if (timeRemaining <= 0 || timeRemaining > duration) {
      setTimeRemaining(duration);
    }
  }, [activeTimer, deadlineMs, paused, timeRemaining, timerDurations]);

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
