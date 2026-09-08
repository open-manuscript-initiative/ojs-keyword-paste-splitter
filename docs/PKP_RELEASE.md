# PKP release and Plugin Gallery preparation

This checklist follows the PKP Plugin Guide for OJS 3.5.

## Before tagging a release

1. Confirm that all CI jobs pass against OJS 3.5.0-5 LTS.
2. Update the four-part release number and date in `version.xml`.
3. Update `README.md` compatibility information and `CHANGELOG.md`.
4. Confirm that the plugin directory name remains `keywordPasteSplitter`, matching the Plugin Gallery `product` value.
5. Tag the exact reviewed commit with the same version as `version.xml`, for example `1.1.0.0`.

The release workflow publishes:

- `keywordPasteSplitter-<version>.tar.gz`;
- an MD5 checksum required by the Plugin Gallery;
- a SHA-256 checksum for independent verification.

Release packages are immutable. Never replace an asset attached to an existing release.

## Plugin Gallery entry template

After the public release exists, add an entry to the Open Manuscript Initiative `plugin-gallery` fork and open a pull request against `pkp/plugin-gallery`. Replace the package URL and MD5 value with those from the immutable release.

```xml
<plugin category="generic" product="keywordPasteSplitter">
  <name locale="en">Keyword Paste Splitter</name>
  <homepage>https://github.com/open-manuscript-initiative/ojs-keyword-paste-splitter</homepage>
  <summary locale="en">Splits pasted keyword lists into separate OJS keyword entries.</summary>
  <description locale="en"><![CDATA[<p>Paste comma-, semicolon-, tab-, or line-break-separated terms into an OJS Keywords field and add them as individual keyword entries.</p>]]></description>
  <installation locale="en"><![CDATA[<p>Install the release package through Upload A New Plugin and enable it under Generic Plugins.</p>]]></installation>
  <maintainer>
    <name>Open Manuscript Initiative</name>
    <institution>Open Manuscript Initiative</institution>
    <email>vargawebkiado@gmail.com</email>
  </maintainer>
  <release date="2026-09-07" version="1.1.0.0" md5="REPLACE_WITH_RELEASE_MD5">
    <package>https://github.com/open-manuscript-initiative/ojs-keyword-paste-splitter/releases/download/1.1.0.0/keywordPasteSplitter-1.1.0.0.tar.gz</package>
    <compatibility application="ojs2">
      <version>3.5.0.5</version>
    </compatibility>
    <description>PKP-compliant release for OJS 3.5.0-5 LTS.</description>
  </release>
</plugin>
```

PKP assigns the certification level after review; do not add a certification element in the initial submission.
