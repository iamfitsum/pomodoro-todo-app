// Simple tick worker that posts remaining seconds based on a deadline
let deadlineMs = null;
let intervalId = null;

function start() {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    if (deadlineMs == null) return;
    const rem = Math.max(0, Math.round((deadlineMs - Date.now()) / 1000));
    postMessage({ type: "tick", remaining: rem });
  }, 1000);
}

onmessage = (e) => {
  const { type, payload } = e.data || {};
  if (type === "set-deadline") {
    deadlineMs = typeof payload === "number" ? payload : null;
    start();
  }
  if (type === "stop") {
    deadlineMs = null;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
};
