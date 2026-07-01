/*
 * Form block — spreadsheet-driven form for AEM Edge Delivery.
 *
 * Authoring contract: the block's first cell links to a form-definition
 * sheet/JSON. Each row of that sheet describes one field with columns:
 *   Name, Label, Type, Placeholder, Mandatory, Options, Value
 * Supported Type values: text, email, tel, number, textarea, select,
 *   checkbox, radio, submit.
 *
 * On submit, the collected data is POSTed as JSON to the form's action
 * (the `Submit` field's Value, or the definition's data path). Responses
 * are stored by the configured submission endpoint (a sheet/workbook).
 */

/**
 * Resolve and fetch the form definition rows from a linked sheet/JSON.
 * @param {string} href URL to the form definition (.json)
 * @returns {Promise<Array>} field definition rows
 */
async function fetchFormDefinition(href) {
  try {
    const resp = await fetch(href);
    if (!resp.ok) return [];
    const json = await resp.json();
    // sheet JSON: { data: [...] }; allow a raw array too
    return Array.isArray(json) ? json : (json.data || []);
  } catch (e) {
    return [];
  }
}

/**
 * Coerce a sheet cell to a boolean (handles "true"/"x"/"yes"/1).
 * @param {*} v cell value
 * @returns {boolean}
 */
function truthy(v) {
  return /^(true|x|yes|1)$/i.test(String(v || '').trim());
}

/**
 * Build a labelled field wrapper for one definition row.
 * @param {Object} row field definition
 * @returns {Element|null} field element, or null for unknown types
 */
function createField(row) {
  const name = (row.Name || row.name || '').trim();
  const type = (row.Type || row.type || 'text').trim().toLowerCase();
  const label = (row.Label || row.label || name).trim();
  const placeholder = (row.Placeholder || row.placeholder || '').trim();
  const mandatory = truthy(row.Mandatory || row.mandatory);
  const options = (row.Options || row.options || '').split(',').map((o) => o.trim()).filter(Boolean);
  const value = (row.Value || row.value || '').trim();
  const id = `form-${name || type}`;

  if (type === 'submit') {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-field form-field-submit';
    const button = document.createElement('button');
    button.type = 'submit';
    button.className = 'form-submit';
    button.textContent = label || 'Submit';
    if (value) button.dataset.action = value;
    wrapper.append(button);
    return wrapper;
  }

  const wrapper = document.createElement('div');
  wrapper.className = `form-field form-field-${type}`;

  const labelEl = document.createElement('label');
  labelEl.setAttribute('for', id);
  labelEl.textContent = label + (mandatory ? ' *' : '');

  let control;
  if (type === 'textarea') {
    control = document.createElement('textarea');
  } else if (type === 'select') {
    control = document.createElement('select');
    if (placeholder) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = placeholder;
      opt.disabled = true;
      opt.selected = true;
      control.append(opt);
    }
    options.forEach((o) => {
      const opt = document.createElement('option');
      opt.value = o;
      opt.textContent = o;
      control.append(opt);
    });
  } else if (type === 'checkbox' || type === 'radio') {
    // group of options rendered as a fieldset
    wrapper.classList.add('form-field-group');
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = label + (mandatory ? ' *' : '');
    fieldset.append(legend);
    options.forEach((o, i) => {
      const optId = `${id}-${i}`;
      const optLabel = document.createElement('label');
      optLabel.className = 'form-option';
      const inp = document.createElement('input');
      inp.type = type;
      inp.name = name;
      inp.id = optId;
      inp.value = o;
      if (mandatory && type === 'radio' && i === 0) inp.required = true;
      optLabel.append(inp, document.createTextNode(` ${o}`));
      fieldset.append(optLabel);
    });
    wrapper.append(fieldset);
    return wrapper;
  } else {
    control = document.createElement('input');
    control.type = ['email', 'tel', 'number'].includes(type) ? type : 'text';
  }

  control.id = id;
  control.name = name;
  if (placeholder && type !== 'select') control.placeholder = placeholder;
  if (mandatory) control.required = true;
  if (value && type !== 'select') control.value = value;

  wrapper.append(labelEl, control);
  return wrapper;
}

/**
 * Collect field values from the form into a plain object.
 * @param {HTMLFormElement} form
 * @returns {Object} key/value submission data
 */
function collectData(form) {
  const data = {};
  const fd = new FormData(form);
  fd.forEach((v, k) => {
    if (data[k] !== undefined) {
      data[k] = [].concat(data[k], v);
    } else {
      data[k] = v;
    }
  });
  return data;
}

/**
 * Submit the form data to its action endpoint.
 * Most endpoints receive the standard EDS shape `{ data: {...} }`. Flat-JSON
 * backends (e.g. Web3Forms at api.web3forms.com) expect the fields at the top
 * level alongside an `access_key`; for those we send the flat payload.
 * @param {string} action endpoint URL
 * @param {Object} data submission payload
 * @param {Object} [extra] extra top-level fields (e.g. { access_key })
 * @returns {Promise<boolean>} success
 */
async function submitForm(action, data, extra = {}) {
  const isFlat = /web3forms\.com|formspree\.io|getform\.io|api\.basin/i.test(action);
  const body = isFlat ? { ...data, ...extra } : { data };
  try {
    const resp = await fetch(action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    return resp.ok;
  } catch (e) {
    return false;
  }
}

/**
 * loads and decorates the form block
 * @param {Element} block the form block element
 */
/**
 * Normalise the authored definition reference to the JSON sheet URL.
 * Handles DA/markdown link mangling where ".json" becomes "-json", links
 * with no extension, and links that use the visible text instead of href.
 * @param {Element} link the authored anchor (may be null)
 * @returns {string|null} a fetchable .json URL
 */
function resolveDefinitionUrl(link) {
  if (!link) return null;
  // prefer href, but fall back to the link's visible text (often the real path)
  let ref = link.getAttribute('href') || link.textContent || '';
  ref = ref.trim();
  if (!ref) return null;
  // DA rewrites "/path.json" -> "/path-json": restore the extension
  ref = ref.replace(/-json$/, '.json');
  // ensure a .json extension so the sheet resolves
  if (!/\.json($|\?)/.test(ref)) ref = `${ref.replace(/\/$/, '')}.json`;
  return ref;
}

export default async function decorate(block) {
  // the form definition is linked in the first cell
  const link = block.querySelector('a[href]');
  const defHref = resolveDefinitionUrl(link);
  block.textContent = '';
  if (!defHref) return;

  const rows = await fetchFormDefinition(defHref);
  if (rows.length === 0) return;

  const form = document.createElement('form');
  form.className = 'form-element';
  form.setAttribute('novalidate', '');

  let action = defHref;
  const extra = {}; // top-level payload fields for flat backends (e.g. access_key)
  rows.forEach((row) => {
    const name = (row.Name || row.name || '').trim();
    const type = (row.Type || row.type || '').trim().toLowerCase();
    // config/hidden rows carry values (e.g. access_key) but are not rendered
    if (type === 'config' || type === 'hidden') {
      if (name) extra[name] = (row.Value || row.value || '').trim();
      return;
    }
    const field = createField(row);
    if (field) form.append(field);
    const submitBtn = field && field.querySelector('.form-submit[data-action]');
    if (submitBtn) action = submitBtn.dataset.action;
  });

  const status = document.createElement('div');
  status.className = 'form-status';
  status.setAttribute('role', 'status');
  form.append(status);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const button = form.querySelector('.form-submit');
    if (button) button.disabled = true;
    status.textContent = 'Submitting…';
    const ok = await submitForm(action, collectData(form), extra);
    status.textContent = ok
      ? 'Thank you! Your details have been submitted.'
      : 'Something went wrong. Please try again.';
    status.classList.toggle('form-status-success', ok);
    status.classList.toggle('form-status-error', !ok);
    if (ok) form.reset();
    if (button) button.disabled = false;
  });

  block.append(form);
}
