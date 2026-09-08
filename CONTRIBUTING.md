# Contributing

Contributions and translations are welcome.

1. Open an issue describing the defect or proposed change.
2. Create a branch from `main`.
3. Keep the plugin compatible with OJS 3.5.0 LTS and avoid changes to OJS core files.
4. Add or update regression tests for behavior changes.
5. Run `node --test tests/keywordPasteSplitter.test.cjs`.
6. Open a pull request and allow the PKP plugin checks to complete.

Locale changes belong in `locale/<locale>/locale.po`. Keep locale keys synchronized across all shipped languages and validate catalogs with `msgfmt --check --check-header`.

By contributing, you agree that your contribution is distributed under the GNU General Public License v3.0.
