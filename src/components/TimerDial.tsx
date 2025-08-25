import { useContext, useEffect, useRef } from "react";
import TimerContext, { TimerVariants } from "~/state/timer/TimerContext";
import { calculateRemainingTimeSeconds } from "~/utils/utils";

export interface ITimerDial {
  timeRemaining: number; // seconds
  timeDuration: number; // seconds
}

const ONE_MINUTE = 60;
const ONE_SECOND = 1000;
const pad2 = (n: number) => String(n).padStart(2, "0");

const TimerDial: React.FC<ITimerDial> = ({ timeRemaining, timeDuration }) => {
  const {
    paused,
    setTimeRemaining,
    activeTimer,
    setActiveTimer,
    setPaused,
    setIsPomodoroFinished,
    completedTomatoes,
    setCompletedTomatoes,
    timerDurations,
    deadlineMs,
    setDeadlineMs,
  } = useContext(TimerContext);

  const secTimeDuration = timeDuration;
  const secTimeRemaining = timeRemaining;

  const circleLength = (secTimeDuration - secTimeRemaining) / secTimeDuration;
  const minutesTime = pad2(Math.floor(secTimeRemaining / ONE_MINUTE));
  const secondsTime = pad2(secTimeRemaining % ONE_MINUTE);
  const timeDisplay = `${minutesTime}:${secondsTime}`;

  const isFinished = secTimeRemaining <= 0;

  // Web Worker tick fallback for background tabs
  const workerRef = useRef<Worker | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const w = new Worker("/workers/timerWorker.js");
      workerRef.current = w;
      w.onmessage = (e: MessageEvent) => {
        const { type, remaining } = e.data || {};
        if (type === "tick" && typeof remaining === "number") {
          setTimeRemaining(remaining);
        }
      };
      return () => {
        w.postMessage({ type: "stop" });
        w.terminate();
        workerRef.current = null;
      };
    } catch {
      // worker may fail in some envs; ignore
    }
  }, [setTimeRemaining]);

  useEffect(() => {
    if (paused || isFinished) return;
    const intervalId = setInterval(() => {
      if (deadlineMs && deadlineMs > Date.now()) {
        setTimeRemaining(calculateRemainingTimeSeconds(deadlineMs));
      } else {
        setTimeRemaining(secTimeRemaining > 0 ? secTimeRemaining - 1 : 0);
      }
    }, ONE_SECOND);
    return () => clearInterval(intervalId);
  }, [paused, isFinished, deadlineMs, secTimeRemaining, setTimeRemaining]);

  useEffect(() => {
    if (!isFinished) return;
    const audio = new Audio("/audio/doorbell.mp3");
    void audio.play();

    if (activeTimer === TimerVariants.POMODORO) {
      setIsPomodoroFinished(true);
      const next = completedTomatoes === 3 ? TimerVariants.LONG : TimerVariants.SHORT;
      const nextDuration = timerDurations[next];
      setCompletedTomatoes(next === TimerVariants.LONG ? 0 : completedTomatoes + 1);
      setActiveTimer(next);
      setTimeRemaining(nextDuration);
      setDeadlineMs(null);
      setPaused(true);
    } else {
      setActiveTimer(TimerVariants.POMODORO);
      setTimeRemaining(timerDurations.pomodoro);
      setDeadlineMs(null);
      setPaused(true);
    }
  }, [
    isFinished,
    activeTimer,
    timerDurations,
    completedTomatoes,
    setCompletedTomatoes,
    setActiveTimer,
    setTimeRemaining,
    setPaused,
    setIsPomodoroFinished,
    setDeadlineMs,
  ]);

  // Keep worker in sync with deadline
  useEffect(() => {
    const w = workerRef.current;
    if (!w) return;
    if (!paused && deadlineMs) {
      w.postMessage({ type: "set-deadline", payload: deadlineMs });
    } else {
      w.postMessage({ type: "stop" });
    }
  }, [paused, deadlineMs]);

  // Ensure immediate recompute on tab visibility change
  useEffect(() => {
    const onVis = () => {
      if (!paused && deadlineMs) {
        const rem = Math.max(0, Math.round((deadlineMs - Date.now()) / 1000));
        setTimeRemaining(rem);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [paused, deadlineMs, setTimeRemaining]);

  return (
    <div className="timer h-[355px] w-[355px] md:h-96 md:w-96">
      <svg className="h-full w-full">
        <circle
          cx="50%"
          cy="50%"
          r="160"
          pathLength="1"
          className="countdown"
          style={{
            strokeDashoffset: circleLength,
          }}
        ></circle>
        <text x="50%" y="50%" textAnchor="middle" className="countdownText">
          {timeDisplay}
        </text>
      </svg>
    </div>
  );
};

export default TimerDial;
