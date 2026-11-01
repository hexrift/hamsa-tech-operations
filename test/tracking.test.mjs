import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {findShipment} from '../lib/tracking.mjs';
const shipments=JSON.parse(readFileSync(new URL('../data/shipments.json',import.meta.url)));
test('a customer can retrieve a shipment regardless of reference case or spacing',()=>{assert.equal(findShipment(shipments,' mv-4821 ')?.destination,'Rotterdam, NL');});
test('unknown and malformed references cannot display another shipment',()=>{assert.equal(findShipment(shipments,'MV-9999'),null);assert.equal(findShipment(shipments,'MV-4821<script>'),null);});
