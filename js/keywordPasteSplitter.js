/**
 * Copyright (c) 2026 Open Manuscript Initiative
 * Distributed under the GNU GPL v3. For full terms see LICENSE.
 */
(function (root, factory) {
    'use strict';

    var api = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    if (root && root.document) {
        api.install(root.document);
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    var FIELD_HINT = /(^|\[|_|-)(keyword|keywords)(\]|_|-|$)/i;
    var LABEL_HINT = /(kulcsszavak|keywords|schlagw[oö]rter)/i;
    var SPLIT_PATTERN = /[;,\t\r\n]+/;

    function normalizeItem(value) {
        var item = String(value || '').replace(/\s+/g, ' ').trim();
        return typeof item.normalize === 'function' ? item.normalize('NFC') : item;
    }

    function comparisonKey(value) {
        return normalizeItem(value).toLocaleLowerCase();
    }

    function cleanItems(text) {
        var seen = Object.create(null);

        return String(text || '')
            .split(SPLIT_PATTERN)
            .map(normalizeItem)
            .filter(function (item) {
                var key;

                if (!item) return false;
                key = comparisonKey(item);
                if (seen[key]) return false;
                seen[key] = true;
                return true;
            });
    }

    function isKeywordInput(input) {
        var identity;
        var field;
        var tagName = input && input.tagName ? input.tagName.toUpperCase() : '';

        if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') return false;
        if (input.disabled || input.readOnly) return false;

        identity = [
            input.name || '',
            input.id || '',
            input.getAttribute('aria-label') || '',
            input.getAttribute('placeholder') || ''
        ].join(' ');

        if (FIELD_HINT.test(identity) || LABEL_HINT.test(identity)) return true;

        field = input.closest('.pkpFormField, .pkpAutosuggest, [class*="pkpFormField"], .form-group');
        return !!field && LABEL_HINT.test(field.textContent || '');
    }

    function componentFromNode(node) {
        var names;
        var i;

        if (!node) return null;
        if (node.__vueParentComponent) return node.__vueParentComponent;
        if (node.__vue__) return node.__vue__.$ || node.__vue__;

        try {
            names = Object.getOwnPropertyNames(node);
        } catch (error) {
            return null;
        }

        for (i = 0; i < names.length; i += 1) {
            if (names[i].indexOf('__vueParentComponent') === 0 && node[names[i]]) {
                return node[names[i]];
            }
        }

        return null;
    }

    function findFieldComponent(input) {
        var node = input;
        var visited = [];

        while (node) {
            var instance = componentFromNode(node);

            while (instance && visited.indexOf(instance) === -1) {
                var proxy;
                var typeName;
                var fieldName;

                visited.push(instance);
                proxy = instance.proxy || instance.ctx || instance;
                typeName = instance.type && (instance.type.name || instance.type.__name) || '';
                fieldName = instance.props && instance.props.name || proxy && proxy.name || '';

                if (
                    proxy &&
                    typeof proxy.setSelected === 'function' &&
                    (
                        typeName === 'FieldControlledVocab' ||
                        FIELD_HINT.test(String(fieldName)) ||
                        (typeof proxy.selectSuggestion === 'function' && 'currentSelected' in proxy)
                    )
                ) {
                    return proxy;
                }

                instance = instance.parent || null;
            }

            node = node.parentElement;
        }

        return null;
    }

    function itemName(selectedItem) {
        if (!selectedItem) return '';
        if (selectedItem.value && typeof selectedItem.value === 'object') {
            return selectedItem.value.name || selectedItem.label || '';
        }
        return selectedItem.label || selectedItem.name || String(selectedItem.value || '');
    }

    function mergeSelected(current, items) {
        var selected = Array.isArray(current) ? current.slice() : [];
        var seen = Object.create(null);

        selected.forEach(function (entry) {
            var name = normalizeItem(itemName(entry));
            if (name) seen[comparisonKey(name)] = true;
        });

        items.forEach(function (item) {
            var normalized = normalizeItem(item);
            var key = comparisonKey(normalized);

            if (!normalized || seen[key]) return;
            seen[key] = true;
            selected.push({
                value: {name: normalized},
                label: normalized,
                identifier: null
            });
        });

        return selected;
    }

    function addThroughComponent(input, items) {
        var field = findFieldComponent(input);
        var selected;

        if (!field) return false;

        selected = mergeSelected(field.currentSelected, items);
        field.setSelected(selected);
        if ('inputValue' in field) field.inputValue = '';
        input.value = '';
        input.focus();
        return true;
    }

    function handlePaste(event) {
        var input = event.target;
        var items;

        if (!isKeywordInput(input) || !event.clipboardData) return;

        items = cleanItems(event.clipboardData.getData('text/plain'));
        if (items.length < 2 || !addThroughComponent(input, items)) return;

        event.preventDefault();
        event.stopImmediatePropagation();
    }

    function install(documentObject) {
        if (!documentObject || documentObject.__keywordPasteSplitterInstalled) return;
        documentObject.__keywordPasteSplitterInstalled = true;
        documentObject.addEventListener('paste', handlePaste, true);
    }

    return {
        cleanItems: cleanItems,
        comparisonKey: comparisonKey,
        itemName: itemName,
        mergeSelected: mergeSelected,
        isKeywordInput: isKeywordInput,
        install: install
    };
}));
