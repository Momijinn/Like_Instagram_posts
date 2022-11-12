import "./style.scss";

const timeoutTimeInput = "#timeout-time-input";

// element
const timeoutTimeInputElement = document.querySelector(
  timeoutTimeInput
) as HTMLInputElement;

// common
const common = {
  initValue: 5,
  timeoutId: "timeoutId",
};

// -------------------------------------------------

chrome.storage.local.get(common.timeoutId, (result) => {
  console.warn(result);
  timeoutTimeInputElement.value = result[common.timeoutId] || common.initValue;
});

timeoutTimeInputElement.addEventListener("change", (e) => {
  const target = e.target as HTMLInputElement;
  chrome.storage.local.set(
    {
      [common.timeoutId]: target.value,
    },
    () => {}
  );
});
