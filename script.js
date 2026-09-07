const option = document.querySelector("#option");
const options = document.querySelector("#options");
const convertBtn = document.querySelector(".convert-btn");
const swapIcon = document.querySelector(".fa-arrow-right-arrow-left");
const amountInput = document.querySelector("input");
const answerPara = document.querySelector(".answer-para");

const currencyListApi =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.min.json";

let exchangeRates = {};
let fromCurrency = "usd";
let toCurrency = "pkr";

function setStatus(message, isError = false) {
  answerPara.textContent = message;
  answerPara.style.color = isError ? "#a33a3a" : "#0b3d5c";
}

function createCurrencyOption(currencyCode) {
  const currencyOption = document.createElement("option");
  currencyOption.value = currencyCode;
  currencyOption.textContent = currencyCode.toUpperCase();
  return currencyOption;
}

function setFlagIcon(currencyCode, side) {
  const container = document.querySelector(
    side === "from" ? ".left-side" : ".right-side",
  );
  const labelRow =
    container.querySelector(".label-row") || document.createElement("div");

  if (!container.querySelector(".label-row")) {
    const label = container.querySelector("label");
    const select = container.querySelector("select");
    labelRow.classList.add("label-row");
    if (label) labelRow.appendChild(label);
    if (select) {
      container.insertBefore(labelRow, select);
    } else {
      container.appendChild(labelRow);
    }
  }

  const existingFlag = labelRow.querySelector(".flag-icon");
  if (existingFlag) existingFlag.remove();

  const flagCode = (currencyCode || "us").slice(0, 2).toUpperCase();
  const flagImage = document.createElement("img");
  flagImage.src = `https://flagsapi.com/${flagCode}/flat/32.png`;
  flagImage.alt = `${currencyCode} flag`;
  flagImage.classList.add("flag-icon");
  labelRow.appendChild(flagImage);
}

async function fetchJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    setStatus("Unable to load exchange rates right now.", true);
    return null;
  }
}

async function loadCurrencyOptions() {
  const currencies = await fetchJson(currencyListApi);
  if (!currencies) return;

  Object.keys(currencies).forEach((currencyCode) => {
    option.appendChild(createCurrencyOption(currencyCode));
    options.appendChild(createCurrencyOption(currencyCode));
  });

  if (Object.prototype.hasOwnProperty.call(currencies, "usd")) {
    option.value = "usd";
    fromCurrency = "usd";
  }

  if (Object.prototype.hasOwnProperty.call(currencies, "pkr")) {
    options.value = "pkr";
    toCurrency = "pkr";
  }

  setFlagIcon(fromCurrency, "from");
  setFlagIcon(toCurrency, "to");
  await updateExchangeRate();
  showConversion();
}

async function updateExchangeRate() {
  const data = await fetchJson(
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCurrency}.json`,
  );

  if (!data || !data[fromCurrency]) {
    exchangeRates = {};
    return;
  }

  exchangeRates = data[fromCurrency] || {};
}

function showConversion() {
  const amount = Number(amountInput.value.trim());

  if (!Number.isFinite(amount) || amount <= 0) {
    setStatus("Please enter a valid amount", true);
    return;
  }

  const conversionRate = exchangeRates[toCurrency];

  if (!conversionRate) {
    setStatus("Currency conversion is not available right now.", true);
    return;
  }

  const convertedValue = amount * conversionRate;
  setStatus(
    `${amount} ${fromCurrency.toUpperCase()} = ${convertedValue.toFixed(2)} ${toCurrency.toUpperCase()}`,
  );
}

async function handleConversion() {
  await updateExchangeRate();
  showConversion();
}

async function swapCurrencies() {
  const previousFrom = fromCurrency;
  fromCurrency = toCurrency;
  toCurrency = previousFrom;

  option.value = fromCurrency;
  options.value = toCurrency;

  answerPara.textContent = "";
  setFlagIcon(fromCurrency, "from");
  setFlagIcon(toCurrency, "to");

  await updateExchangeRate();
}

option.addEventListener("change", async () => {
  fromCurrency = option.value.toLowerCase();
  answerPara.textContent = "";
  setFlagIcon(fromCurrency, "from");
  await updateExchangeRate();
});

options.addEventListener("change", () => {
  toCurrency = options.value.toLowerCase();
  answerPara.textContent = "";
  setFlagIcon(toCurrency, "to");
});

swapIcon.addEventListener("click", async () => {
  await swapCurrencies();
});

convertBtn.addEventListener("click", handleConversion);

amountInput.addEventListener("keydown", (event) => {
  if (event.key === "-" || event.key === "e" || event.key === "E") {
    event.preventDefault();
  }

  if (event.key === "Enter") {
    event.preventDefault();
    handleConversion();
  }
});

amountInput.addEventListener("input", () => {
  if (amountInput.value.includes("-")) {
    amountInput.value = amountInput.value.replace(/-/g, "");
  }

  if (Number(amountInput.value) < 0) {
    amountInput.value = String(Math.abs(Number(amountInput.value || 0)));
  }
});

[option, options].forEach((selectElement) => {
  selectElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleConversion();
    }
  });
});

loadCurrencyOptions();
