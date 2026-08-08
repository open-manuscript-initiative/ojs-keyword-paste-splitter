<?php

namespace APP\plugins\generic\keywordPasteSplitter;

use APP\core\Application;
use PKP\plugins\GenericPlugin;
use PKP\plugins\Hook;
use PKP\template\PKPTemplateManager;

class KeywordPasteSplitterPlugin extends GenericPlugin
{
    public function register($category, $path, $mainContextId = null): bool
    {
        $success = parent::register($category, $path, $mainContextId);

        if ($success && $this->getEnabled($mainContextId)) {
            Hook::add('TemplateManager::display', [$this, 'addAssets']);
        }

        return $success;
    }

    public function getDisplayName(): string
    {
        return __('plugins.generic.keywordPasteSplitter.displayName');
    }

    public function getDescription(): string
    {
        return __('plugins.generic.keywordPasteSplitter.description');
    }

    public function addAssets(string $hookName, array $args): bool
    {
        /** @var PKPTemplateManager $templateMgr */
        $templateMgr = $args[0];
        $request = Application::get()->getRequest();

        // The field exists in the editorial/submission backend. Loading the
        // small script in backend context avoids touching the public site.
        $templateMgr->addJavaScript(
            'keywordPasteSplitter105',
            $request->getBaseUrl() . '/' . $this->getPluginPath() . '/js/keywordPasteSplitter.js?v=1.0.5.0',
            ['contexts' => ['backend']]
        );

        return false;
    }
}
