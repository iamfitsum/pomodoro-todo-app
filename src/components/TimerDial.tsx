import TimerContext from "~/state/timer/TimerContext";
import { useContext, useEffect } from "react";
// import alarmAudio from "/doorbell.mp3";

export interface ITimerDial {
  /**
   * Time left in seconds
   */
  timeRemaining: number;
  /**
   * Full time duration in seconds
   */
  timeDuration: number;
}

/**
 * How many seconds in a minute
 */
const ONE_MINUTE = 60;
/**
 * How many milliseconds in a second
 */
const ONE_SECOND = 1000;

const convertMinutesToSeconds = (minutes: number): number =>
  +(minutes * ONE_MINUTE).toFixed(2);

const convertSecondsToMinutes = (seconds: number): number =>
  +(seconds / ONE_MINUTE).toFixed(2);

const secondsToMinutesString = (seconds: number) =>
  parseInt(`${seconds}`).toString().padStart(2, "0");

const TimerDial: React.FC<ITimerDial> = ({ timeRemaining, timeDuration }) => {
  const { paused, setTimeRemaining } = useContext(TimerContext);

  const secTimeDuration = convertMinutesToSeconds(timeDuration);
  const secTimeRemaining = convertMinutesToSeconds(timeRemaining);

  const circleLength = (secTimeDuration - secTimeRemaining) / secTimeDuration;
  const minutesTime = secondsToMinutesString(secTimeRemaining / ONE_MINUTE);
  const secondsTime = secondsToMinutesString(secTimeRemaining % ONE_MINUTE);
  const timeDisplay = `${minutesTime}:${secondsTime}`;

  const isFinished = secTimeRemaining <= 0;

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!paused && !isFinished) {
        const minutesRemaining = convertSecondsToMinutes(secTimeRemaining - 1);
        setTimeRemaining(minutesRemaining);
      } else if (isFinished) {
        // play audio on timeout
        const audio = new Audio("/audio/doorbell.mp3");
        void audio.play();
        // force timeout to stop
        clearInterval(intervalId);
      }
    }, ONE_SECOND);

    return () => clearInterval(intervalId);
  }, [paused, isFinished, secTimeRemaining, setTimeRemaining]);

  // const handleToggle = () => {
  //   setPaused(!paused);

  //   if (isFinished) {
  //     setTimeRemaining(timeDuration);
  //     setPaused(false);
  //   }
  // };

  return (
    <div className="timer">
      <svg className="h-full w-full">
        <circle
          cx="50%"
          cy="50%"
          r="150"
          pathLength="1"
          className="countdown"
          style={{
            strokeDashoffset: circleLength,
          }}></circle>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          className="countdownText">
          {timeDisplay}
        </text>
      </svg>
    </div>
  );
};

export default TimerDial;
