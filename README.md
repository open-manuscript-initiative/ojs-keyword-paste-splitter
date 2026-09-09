# Keyword Paste Splitter for OJS

[![PKP plugin checks](https://github.com/open-manuscript-initiative/ojs-keyword-paste-splitter/actions/workflows/ci.yml/badge.svg)](https://github.com/open-manuscript-initiative/ojs-keyword-paste-splitter/actions/workflows/ci.yml)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

Keyword Paste Splitter is a generic plugin for Open Journal Systems (OJS). It turns a list pasted into a publication's **Keywords** metadata field into separate keyword entries.

Supported separators:

- commas;
- semicolons;
- tabs, including columns copied from a spreadsheet;
- line breaks.

Whitespace is normalized, empty values are discarded, and duplicates are removed without replacing keywords that are already present.

## Compatibility

| Plugin release | OJS release |
| --- | --- |
| 1.1.2.0 | OJS 3.5.0-5 LTS |
| 1.1.1.0 | OJS 3.5.0-5 LTS — superseded by 1.1.2.0 |
| 1.1.0.0 | OJS 3.5.0-5 LTS |

The plugin is tested with PHP 8.2 and 8.3 and with both MySQL and PostgreSQL through PKP's plugin test environment.

## Installation

### From a release package

1. Download `keywordPasteSplitter-<version>.tar.gz` from the [Releases](https://github.com/open-manuscript-initiative/ojs-keyword-paste-splitter/releases) page.
2. In OJS, open **Administration → Hosted Journals → Manage Plugins** or **Settings → Website → Plugins**, depending on your role and installation.
3. Select **Upload A New Plugin** and upload the `.tar.gz` file.
4. Find **Keyword Paste Splitter** under **Generic Plugins** and enable it.

Starting with version 1.1.2.0, the plugin entry point explicitly loads its own namespaced plugin class. No bootstrap, loader, or other PHP file needs to be copied into the OJS installation root.

If an earlier local deployment used an additional root-level PHP loader as a workaround, install version 1.1.2.0 while the helper is still present, verify that the plugin is enabled, then remove the helper and test keyword pasting again. The helper is no longer part of the supported installation.

### Manual installation

Extract the plugin into the following directory, preserving the exact directory name:

```text
plugins/generic/keywordPasteSplitter
```

Then register the plugin version from the OJS root if required:

```bash
php lib/pkp/tools/installPluginVersion.php plugins/generic/keywordPasteSplitter/version.xml
```

Enable the plugin in **Settings → Website → Plugins → Generic Plugins**.

No other files outside `plugins/generic/keywordPasteSplitter` are required.

## Usage

1. Open a submission or publication metadata form.
2. Place the cursor in the **Keywords** field for the required language.
3. Paste two or more keywords separated by commas, semicolons, tabs, or line breaks.
4. The pasted values appear immediately as individual OJS keyword entries.

A single pasted value is left to OJS's normal input handling. Existing keywords are preserved.

## Privacy and security

The plugin runs locally in the authenticated OJS editorial interface. It does not store additional data, create database tables, set cookies, or send keyword content to an external service.

Only the editorial backend loads the JavaScript asset. Public journal pages are not modified.

## Development and testing

The CI workflow uses the Open Manuscript Initiative forks of [OJS](https://github.com/open-manuscript-initiative/ojs) and the related PKP repositories. The `stable-3_5_0` branch is pinned to the OJS 3.5.0-5 LTS source.

Run the PHP entry-point and JavaScript regression tests locally with:

```bash
php tests/pluginRegistration.test.php
node --test tests/keywordPasteSplitter.test.cjs
```

The PHP regression test loads the real plugin `index.php`, verifies that it can instantiate the namespaced plugin class without an external helper file, and checks registration of the plugin-local backend JavaScript asset.

The PKP workflow also checks PHP syntax, `version.xml`, locale catalogs, PHP 8.2/8.3, MySQL, and PostgreSQL.

## Releases and Plugin Gallery

Release tags use PKP's required four-part version format, for example `1.1.2.0`. A matching tag automatically creates a `.tar.gz` package with a single top-level `keywordPasteSplitter` directory and publishes MD5 and SHA-256 checksums.

See [PKP release and Plugin Gallery preparation](docs/PKP_RELEASE.md) for the complete maintainer procedure.

## Support and contributions

- Report defects through GitHub Issues.
- Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a change.
- Report security issues according to [SECURITY.md](SECURITY.md).

## License

Copyright © 2026 Open Manuscript Initiative.

This plugin is distributed under the [GNU General Public License v3.0](LICENSE), a GPL-compatible license as required for PKP Plugin Gallery submissions.
