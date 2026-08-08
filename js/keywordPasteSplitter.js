(function () {
    'use strict';

    var FIELD_HINT = /(^|\[|_|-)(keyword|keywords)(\]|_|-|$)/i;
    var LABEL_HINT = /(kulcsszavak|keywords|schlagw[oö]rter)/i;
    var SPLIT_PATTERN = /[;,\r\n]+/;

    function cleanItems(text) {
        var seen = Object.create(null);
        return String(text || '')
            .split(SPLIT_PATTERN)
            .map(function (item) {
                return item.replace(/\s+/g, ' ').trim();
            })
            .filter(function (item) {
                if (!item) return false;
                var key = item.toLocaleLowerCase();
                if (seen[key]) return false;
                seen[key] = true;
                return true;
            });
    }

    function isKeywordInput(input) {
        if (!(input instanceof HTMLInputElement) && !(input instanceof HTMLTextAreaElement)) return false;

        var identity = [
            input.name || '',
            input.id || '',
            input.getAttribute('aria-label') || '',
            input.getAttribute('placeholder') || ''
        ].join(' ');

        if (FIELD_HINT.test(identity) || LABEL_HINT.test(identity)) return true;

        var field = input.closest('.pkpFormField, .pkpAutosuggest, [class*="pkpFormField"], .form-group');
        return !!field && LABEL_HINT.test(field.textContent || '');
    }

    function componentFromNode(node) {
        if (!node) return null;

        if (node.__vueParentComponent) return node.__vueParentComponent;
        if (node.__vue__) return node.__vue__.$;

        var names;
        try {
            names = Object.getOwnPropertyNames(node);
        } catch (e) {
            return null;
        }

        for (var i = 0; i < names.length; i++) {
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
                visited.push(instance);

                var proxy = instance.proxy || instance.ctx || null;
                var typeName = instance.type && (instance.type.name || instance.type.__name) || '';
                var fieldName = instance.props && instance.props.name || proxy && proxy.name || '';

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

    function addThroughComponent(input, items) {
        var field = findFieldComponent(input);
        if (!field) return false;

        var current = Array.isArray(field.currentSelected) ? field.currentSelected : [];
        var selected = current.slice();
        var seen = Object.create(null);

        selected.forEach(function (entry) {
            var name = itemName(entry).replace(/\s+/g, ' ').trim();
            if (name) seen[name.toLocaleLowerCase()] = true;
        });

        items.forEach(function (item) {
            var key = item.toLocaleLowerCase();
            if (seen[key]) return;
            seen[key] = true;
            selected.push({
                value: {name: item},
                label: item,
                identifier: null
            });
        });

        field.setSelected(selected);
        if ('inputValue' in field) field.inputValue = '';
        input.value = '';
        input.focus();
        return true;
    }

    document.addEventListener('paste', function (event) {
        var input = event.target;
        if (!isKeywordInput(input) || !event.clipboardData) return;

        var items = cleanItems(event.clipboardData.getData('text/plain'));
        if (items.length < 2) return;

        if (!addThroughComponent(input, items)) return;

        event.preventDefault();
        event.stopImmediatePropagation();
    }, true);
}());
