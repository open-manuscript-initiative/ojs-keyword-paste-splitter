<?php
/**
 * @file KeywordPasteSplitterPlugin.php
 *
 * Copyright (c) 2026 Open Manuscript Initiative
 * Distributed under the GNU GPL v3. For full terms see LICENSE.
 *
 * @class KeywordPasteSplitterPlugin
 * @brief Splits pasted keyword lists into separate OJS keyword entries.
 */

namespace APP\plugins\generic\keywordPasteSplitter;

use APP\core\Application;
use PKP\plugins\GenericPlugin;
use PKP\plugins\Hook;
use PKP\template\PKPTemplateManager;

class KeywordPasteSplitterPlugin extends GenericPlugin
{
    /** @copydoc GenericPlugin::register() */
    public function register($category, $path, $mainContextId = null): bool
    {
        $success = parent::register($category, $path, $mainContextId);

        if (!$success || Application::isUnderMaintenance()) {
            return $success;
        }

        // OJS can register generic plugins before resolving the journal context.
        // Defer the enabled-state check until the template is rendered.
        Hook::add('TemplateManager::display', $this->addAssets(...));

        return $success;
    }

    /** @copydoc Plugin::getDisplayName() */
    public function getDisplayName(): string
    {
        return __('plugins.generic.keywordPasteSplitter.displayName');
    }

    /** @copydoc Plugin::getDescription() */
    public function getDescription(): string
    {
        return __('plugins.generic.keywordPasteSplitter.description');
    }

    /**
     * Load the paste handler only in the editorial backend.
     *
     * @param array{0: PKPTemplateManager} $args
     */
    public function addAssets(string $hookName, array $args): bool
    {
        $request = Application::get()->getRequest();
        $context = $request->getContext();
        if (!$context || !$this->getEnabled($context->getId())) {
            return Hook::CONTINUE;
        }

        $templateManager = $args[0];
        $version = $this->getCurrentVersion();
        $versionQuery = $version ? '?v=' . rawurlencode($version->getVersionString()) : '';

        $templateManager->addJavaScript(
            'keywordPasteSplitter',
            $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/keywordPasteSplitter.js' . $versionQuery,
            ['contexts' => ['backend']]
        );

        return Hook::CONTINUE;
    }
}
