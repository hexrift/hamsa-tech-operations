import {findShipment} from './lib/tracking.mjs';

const form = document.querySelector('[data-tracking-form]');
const input = document.querySelector('#shipment-reference');
const result = document.querySelector('[data-tracking-result]');
const message = document.querySelector('[data-tracking-message]');
const quickReferences = document.querySelector('[data-quick-references]');
const register = document.querySelector('[data-shipment-register]');
const count = document.querySelector('[data-shipment-count]');
const revision = document.querySelector('[data-revision]');

let shipments = [];

function node(tag, className, text) {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (text !== undefined) item.textContent = text;
  return item;
}

function statusClass(status) {
  return String(status).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function showUnavailable(text) {
  result.replaceChildren();
  result.dataset.trackingState = 'unavailable';
  delete result.dataset.shipmentReference;
  message.textContent = text;
  const empty = node('div', 'empty-state');
  empty.append(node('div', 'empty-icon', '×'), node('h3', '', 'Record unavailable'), node('p', '', 'The shipment view could not be loaded. Please try again.'));
  result.append(empty);
}

function showNotFound() {
  result.replaceChildren();
  result.dataset.trackingState = 'not-found';
  delete result.dataset.shipmentReference;
  message.textContent = 'We could not find that reference. Check the number and try again.';
  const empty = node('div', 'empty-state');
  empty.append(node('div', 'empty-icon', '⌕'), node('h3', '', 'Reference not found'), node('p', '', 'Check the shipment number or choose a recent reference from the register.'));
  result.append(empty);
}

function renderShipment(shipment) {
  const header = node('div', 'result-top');
  const reference = node('div', 'result-ref-block');
  reference.append(node('small', '', 'REFERENCE'), node('strong', 'result-reference', shipment.reference));
  header.append(reference, node('span', 'result-status ' + statusClass(shipment.status), shipment.status));

  const route = node('div', 'result-route');
  const origin = node('div', 'route-point');
  origin.append(node('small', '', 'ORIGIN'), node('strong', '', shipment.origin));
  const direction = node('div', 'route-line');
  direction.setAttribute('aria-label', 'to');
  direction.append(node('span', '', '→'));
  const destination = node('div', 'route-point destination');
  destination.append(node('small', '', 'DESTINATION'), node('strong', '', shipment.destination));
  route.append(origin, direction, destination);

  const meta = node('div', 'result-meta');
  const service = node('span');
  service.append(node('small', '', 'SERVICE'), node('strong', '', shipment.service));
  const expected = node('span');
  expected.append(node('small', '', 'EXPECTED DELIVERY'), node('strong', '', shipment.expected));
  meta.append(service, expected);

  const nextMilestone = shipment.milestones.find(step => !step.complete);
  const milestoneHeading = node('div', 'milestone-heading');
  milestoneHeading.append(
    node('strong', '', 'Delivery milestones'),
    node('span', '', nextMilestone ? 'Next: ' + nextMilestone.label : 'All milestones complete')
  );
  const milestones = node('ol', 'milestone-list');
  for (const step of shipment.milestones) {
    const item = node('li', step.complete ? 'complete' : 'upcoming');
    item.append(node('span', 'milestone-dot'), node('span', '', step.label));
    milestones.append(item);
  }

  result.replaceChildren(header, route, meta, milestoneHeading, milestones);
  result.dataset.trackingState = 'ready';
  result.dataset.shipmentReference = shipment.reference;
  message.textContent = 'Showing the latest staging record for ' + shipment.reference + '.';
}

function search(reference, updateLocation = false) {
  const normalized = String(reference).trim();
  if (!normalized) return;
  input.value = normalized;
  if (updateLocation) history.replaceState(null, '', '?ref=' + encodeURIComponent(normalized) + '#track');
  result.dataset.trackingState = 'loading';
  message.textContent = 'Retrieving shipment…';
  const shipment = findShipment(shipments, normalized);
  if (shipment) renderShipment(shipment);
  else showNotFound();
}

function renderRegister() {
  quickReferences.replaceChildren();
  register.replaceChildren();
  count.textContent = shipments.length + ' controlled records';
  for (const shipment of shipments) {
    const quick = node('button', 'quick-ref', shipment.reference);
    quick.type = 'button';
    quick.addEventListener('click', () => search(shipment.reference, true));
    quickReferences.append(quick);

    const row = node('tr');
    const refCell = node('td');
    const refButton = node('button', 'table-open table-ref', shipment.reference);
    refButton.type = 'button';
    refButton.setAttribute('aria-label', 'Open ' + shipment.reference);
    refButton.addEventListener('click', () => search(shipment.reference, true));
    refCell.append(refButton);
    const routeCell = node('td', 'table-route', shipment.origin);
    routeCell.append(node('small', '', 'to ' + shipment.destination));
    const statusCell = node('td');
    statusCell.append(node('span', 'table-status ' + statusClass(shipment.status), shipment.status));
    const openCell = node('td');
    const openButton = node('button', 'table-open', '↗');
    openButton.type = 'button';
    openButton.setAttribute('aria-label', 'Open ' + shipment.reference + ' delivery overview');
    openButton.addEventListener('click', () => search(shipment.reference, true));
    openCell.append(openButton);
    row.append(refCell, routeCell, node('td', '', shipment.service), statusCell, node('td', '', shipment.expected), openCell);
    register.append(row);
  }
}

async function loadRevision() {
  try {
    const response = await fetch('./build.json', {cache: 'no-store'});
    if (!response.ok) throw new Error('build unavailable');
    const build = await response.json();
    revision.textContent = typeof build.commit === 'string' ? build.commit.slice(0, 7) : 'unavailable';
  } catch {
    revision.textContent = 'unavailable';
  }
}

async function start() {
  try {
    const response = await fetch('./data/shipments.json', {cache: 'no-store'});
    if (!response.ok) throw new Error('records unavailable');
    const records = await response.json();
    if (!Array.isArray(records)) throw new Error('invalid records');
    shipments = records;
    renderRegister();
    const initial = new URLSearchParams(location.search).get('ref') || shipments[0]?.reference;
    if (initial) search(initial);
    else showUnavailable('No shipment records are currently available.');
  } catch {
    count.textContent = 'Records unavailable';
    register.replaceChildren();
    const row = node('tr');
    const cell = node('td', 'table-loading', 'Shipment records are temporarily unavailable.');
    cell.colSpan = 6;
    row.append(cell);
    register.append(row);
    showUnavailable('Tracking is temporarily unavailable. Please try again.');
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  search(input.value, true);
});

loadRevision();
start();
