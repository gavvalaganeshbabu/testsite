/*
 * EMI Calculator block — Personal Loan.
 * Renders amount / interest-rate / tenure controls and computes the monthly
 * EMI, total interest, and total payable using the standard reducing-balance
 * formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1), where r = monthly rate,
 * n = tenure in months.
 *
 * Authoring (optional): the block may contain rows overriding defaults:
 *   Amount | 500000
 *   Rate   | 10.5
 *   Tenure | 36
 */

const DEFAULTS = { amount: 500000, rate: 10.5, tenure: 36 };
const RANGES = {
  amount: { min: 50000, max: 5000000, step: 10000 },
  rate: { min: 8, max: 24, step: 0.1 },
  tenure: { min: 6, max: 84, step: 6 },
};

/**
 * Read author-provided default overrides from the block's rows.
 * @param {Element} block the block element
 * @returns {Object} merged defaults
 */
function readDefaults(block) {
  const out = { ...DEFAULTS };
  block.querySelectorAll(':scope > div').forEach((row) => {
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    const val = parseFloat(cells[1].textContent.replace(/[^0-9.]/g, ''));
    if (!Number.isNaN(val) && out[key] !== undefined) out[key] = val;
  });
  return out;
}

/**
 * Format a number as Indian Rupees (no decimals).
 * @param {number} n value
 * @returns {string} formatted currency
 */
function formatINR(n) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

/**
 * Compute EMI and totals.
 * @param {number} principal loan amount
 * @param {number} annualRate annual interest rate (percent)
 * @param {number} months tenure in months
 * @returns {{emi:number,totalInterest:number,totalPayable:number}}
 */
function computeEmi(principal, annualRate, months) {
  const r = annualRate / 12 / 100;
  let emi;
  if (r === 0) emi = principal / months;
  else {
    const f = (1 + r) ** months;
    emi = (principal * r * f) / (f - 1);
  }
  const totalPayable = emi * months;
  return { emi, totalInterest: totalPayable - principal, totalPayable };
}

/**
 * Build one labelled range+number control.
 * @param {string} key field key
 * @param {string} label visible label
 * @param {number} value initial value
 * @param {string} suffix unit suffix for display
 * @returns {{field:Element, input:HTMLInputElement, valueEl:Element}}
 */
function buildControl(key, label, value, suffix) {
  const field = document.createElement('div');
  field.className = 'emi-field';

  const head = document.createElement('div');
  head.className = 'emi-field-head';
  const labelEl = document.createElement('label');
  labelEl.textContent = label;
  labelEl.setAttribute('for', `emi-${key}`);
  const valueEl = document.createElement('output');
  valueEl.className = 'emi-field-value';
  head.append(labelEl, valueEl);

  const input = document.createElement('input');
  input.type = 'range';
  input.id = `emi-${key}`;
  input.min = RANGES[key].min;
  input.max = RANGES[key].max;
  input.step = RANGES[key].step;
  input.value = value;
  input.dataset.suffix = suffix;

  field.append(head, input);
  return { field, input, valueEl };
}

/**
 * loads and decorates the EMI calculator block
 * @param {Element} block the block element
 */
export default function decorate(block) {
  const defaults = readDefaults(block);
  block.textContent = '';

  const heading = document.createElement('h3');
  heading.className = 'emi-heading';
  heading.textContent = 'Personal Loan EMI Calculator';

  const controls = document.createElement('div');
  controls.className = 'emi-controls';
  const amount = buildControl('amount', 'Loan Amount', defaults.amount, '₹');
  const rate = buildControl('rate', 'Interest Rate (% p.a.)', defaults.rate, '%');
  const tenure = buildControl('tenure', 'Tenure (months)', defaults.tenure, 'mo');
  controls.append(amount.field, rate.field, tenure.field);

  const results = document.createElement('div');
  results.className = 'emi-results';
  const emiRow = document.createElement('div');
  emiRow.className = 'emi-result emi-result-primary';
  const interestRow = document.createElement('div');
  interestRow.className = 'emi-result';
  const totalRow = document.createElement('div');
  totalRow.className = 'emi-result';
  results.append(emiRow, interestRow, totalRow);

  block.append(heading, controls, results);

  const update = () => {
    const p = parseFloat(amount.input.value);
    const ar = parseFloat(rate.input.value);
    const m = parseFloat(tenure.input.value);
    amount.valueEl.textContent = formatINR(p);
    rate.valueEl.textContent = `${ar}%`;
    tenure.valueEl.textContent = `${m} mo`;
    const { emi, totalInterest, totalPayable } = computeEmi(p, ar, m);
    emiRow.innerHTML = `<span class="emi-result-label">Monthly EMI</span><span class="emi-result-amount">${formatINR(emi)}</span>`;
    interestRow.innerHTML = `<span class="emi-result-label">Total Interest</span><span class="emi-result-amount">${formatINR(totalInterest)}</span>`;
    totalRow.innerHTML = `<span class="emi-result-label">Total Payable</span><span class="emi-result-amount">${formatINR(totalPayable)}</span>`;
  };

  [amount.input, rate.input, tenure.input].forEach((i) => i.addEventListener('input', update));
  update();
}
