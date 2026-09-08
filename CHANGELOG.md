# Changelog

All notable changes to this project are documented in this file.

## [1.1.0.0] - 2026-09-07

### Added

- PKP-compatible GPL v3 licensing, installation, compatibility, security, contribution, and release documentation.
- Automated OJS 3.5 LTS checks across PHP 8.2/8.3, MySQL, and PostgreSQL.
- Regression tests for splitting, Unicode normalization, duplicate handling, and preservation of existing keywords.
- Reproducible `.tar.gz` release packaging with MD5 and SHA-256 checksums.

### Changed

- Skip hook registration while OJS is under maintenance.
- Derive the browser cache key from the installed plugin version.
- Load the asset with a stable identifier and return PKP's explicit `Hook::CONTINUE` value.
- Correct Vue 2 component discovery while retaining OJS 3.5 Vue 3 support.
- Normalize Unicode and accept tab-separated keyword lists.

## [1.0.5.0] - 2026-07-13

- Added English, Hungarian, and German localization.
- Corrected the plugin name and description in the plugin list.

## [1.0.4.0]

- Added keywords through the OJS controlled-vocabulary component in one update.
- Removed delayed keyboard-event simulation.
- Added asset versioning to avoid stale browser caches.
