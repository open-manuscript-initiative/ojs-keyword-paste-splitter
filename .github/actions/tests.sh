#!/usr/bin/env bash

set -euo pipefail

plugin_dir="plugins/generic/keywordPasteSplitter"

if ! command -v xmllint >/dev/null || ! command -v msgfmt >/dev/null; then
    sudo apt-get update
    sudo apt-get install -y gettext libxml2-utils
fi

find "$plugin_dir" -type f -name '*.php' -print0 | xargs -0 -n1 php -l
node --test "$plugin_dir/tests/keywordPasteSplitter.test.cjs"
xmllint --noout "$plugin_dir/version.xml"

for locale_file in "$plugin_dir"/locale/*/locale.po; do
    msgfmt --check --check-header -o /dev/null "$locale_file"
done
