const test = require('node:test');
const assert = require('node:assert/strict');
const splitter = require('../js/keywordPasteSplitter.js');

test('splits commas, semicolons, tabs and line breaks', () => {
    assert.deepEqual(
        splitter.cleanItems('history, theology; archives\nHungary\tReformation'),
        ['history', 'theology', 'archives', 'Hungary', 'Reformation']
    );
});

test('trims whitespace and removes case-insensitive duplicates', () => {
    assert.deepEqual(
        splitter.cleanItems('  History ;history; Church   history ; CHURCH HISTORY '),
        ['History', 'Church history']
    );
});

test('normalizes canonically equivalent Unicode values', () => {
    assert.deepEqual(splitter.cleanItems('reformáció;reforma\u0301cio\u0301'), ['reformáció']);
});

test('reads PKP controlled vocabulary item shapes', () => {
    assert.equal(splitter.itemName({value: {name: 'History'}, label: 'History'}), 'History');
    assert.equal(splitter.itemName({value: 'history', label: 'History'}), 'History');
});

test('merges pasted entries without replacing existing keywords', () => {
    const existing = [{value: {name: 'History'}, label: 'History', identifier: null}];
    const merged = splitter.mergeSelected(existing, ['history', 'Archives']);

    assert.equal(merged.length, 2);
    assert.equal(merged[0], existing[0]);
    assert.deepEqual(merged[1], {
        value: {name: 'Archives'},
        label: 'Archives',
        identifier: null
    });
});

test('treats a missing selected array as empty', () => {
    assert.deepEqual(splitter.mergeSelected(undefined, ['History']), [{
        value: {name: 'History'},
        label: 'History',
        identifier: null
    }]);
});
