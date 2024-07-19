function getCookie(name) {
  let cookieArray = document.cookie.split(";");
  for (let i = 0; i < cookieArray.length; i++) {
    let cookiePair = cookieArray[i].split("=");
    if (name == cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1]);
    }
  }
  return null;
}

function setDebugNamespace(namespace) {
  if (window.localStorage) {
    localStorage.setItem("debug", `${namespace}*`);
  }
}

// get a random num between 3 - 5
function getRandom() {
  return Math.floor(Math.random() * 3) + 3;
}

function sleep(delay = 1) {
  log("tools", `Waiting for ${delay} seconds ...`);
  return new Promise((resolve) => setTimeout(resolve, delay * 1000));
}

function getDelayUntilNextTargetTime(targetHour, targetMinute = 0) {
  log(
    "tools",
    `Target time: ${targetHour > 9 ? targetHour : ("0" + targetHour)}:${
      targetMinute > 9 ? targetMinute : ("0" + targetMinute)
    }`
  );
  const now = new Date();
  let targetTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    targetHour,
    targetMinute,
    0,
    0
  );

  // If the target time has already passed today, set it for tomorrow
  if (now > targetTime) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  return targetTime - now;
}

function ms2str(ms) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;

  return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
}

const log = (name, ...args) => {
  const message = args.join(" ");
  const time = new Date().toLocaleString("zh-CN", { hour12: false });
  console.log(`[${time}] ${name}: ${message}`);
};

export {
  getCookie,
  setDebugNamespace,
  sleep,
  getDelayUntilNextTargetTime,
  ms2str,
  log,
};
