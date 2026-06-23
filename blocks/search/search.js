/*
 * Search block — client-side search over the published query-index.json.
 * Reads the `q` query parameter, fetches the index, ranks matches by
 * title/description/path, and renders a results list. Includes a search
 * input so users can refine the query on the page.
 */

const INDEX_PATH = '/query-index.json';

/**
 * Fetch the site index. Returns an array of page records.
 * @returns {Promise<Array>} index rows
 */
async function fetchIndex() {
  try {
    const resp = await fetch(INDEX_PATH);
    if (!resp.ok) return [];
    const json = await resp.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    return [];
  }
}

/**
 * Score a record against the lowercased query terms. Title hits weigh most,
 * then description, then path. Returns 0 when nothing matches.
 * @param {Object} row index record
 * @param {string[]} terms lowercased search terms
 * @returns {number} relevance score
 */
function scoreRow(row, terms) {
  const title = (row.title || '').toLowerCase();
  const desc = (row.description || '').toLowerCase();
  const path = (row.path || '').toLowerCase();
  let score = 0;
  terms.forEach((t) => {
    if (title.includes(t)) score += 10;
    if (desc.includes(t)) score += 4;
    if (path.includes(t)) score += 1;
  });
  return score;
}

/**
 * Build a single result item element.
 * @param {Object} row index record
 * @returns {Element} list item
 */
function renderResult(row) {
  const li = document.createElement('li');
  li.className = 'search-result';
  const a = document.createElement('a');
  a.href = row.path;
  a.className = 'search-result-link';
  const title = document.createElement('span');
  title.className = 'search-result-title';
  title.textContent = row.title || row.path;
  a.append(title);
  if (row.description) {
    const desc = document.createElement('span');
    desc.className = 'search-result-desc';
    desc.textContent = row.description;
    a.append(desc);
  }
  li.append(a);
  return li;
}

/**
 * Render results for a query into the given container.
 * @param {Element} resultsEl results list container
 * @param {Array} index full index
 * @param {string} query raw query string
 */
function renderResults(resultsEl, index, query) {
  resultsEl.textContent = '';
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) {
    resultsEl.innerHTML = '<li class="search-empty">Type a search term above.</li>';
    return;
  }
  const matches = index
    .map((row) => ({ row, score: scoreRow(row, terms) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    resultsEl.innerHTML = `<li class="search-empty">No results found for "${query}".</li>`;
    return;
  }
  matches.forEach((m) => resultsEl.append(renderResult(m.row)));
}

/**
 * loads and decorates the search block
 * @param {Element} block the search block element
 */
export default async function decorate(block) {
  block.textContent = '';

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  // search form (built in JS; not authored in the fragment)
  const form = document.createElement('form');
  form.className = 'search-form';
  form.setAttribute('role', 'search');

  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.className = 'search-input';
  input.placeholder = 'Search';
  input.setAttribute('aria-label', 'Search');
  input.value = initialQuery;

  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'search-submit';
  button.textContent = 'Search';

  form.append(input, button);

  const results = document.createElement('ul');
  results.className = 'search-results';

  block.append(form, results);

  const index = await fetchIndex();

  const run = (q) => renderResults(results, index, q);
  run(initialQuery);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    const url = new URL(window.location.href);
    if (q) url.searchParams.set('q', q);
    else url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
    run(q);
  });
}
