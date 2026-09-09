<?php

declare(strict_types=1);

namespace PKP\plugins {
    class Hook
    {
        public const CONTINUE = false;
        public static array $registered = [];

        public static function add(string $name, callable $callback): void
        {
            self::$registered[] = $name;
        }
    }

    class GenericPlugin
    {
        public array $enabledContexts = [];

        public function register($category, $path, $mainContextId = null): bool
        {
            return true;
        }

        public function getEnabled($contextId = null): bool
        {
            return (bool)($this->enabledContexts[(int)$contextId] ?? false);
        }

        public function getCurrentVersion(): object
        {
            return new class {
                public function getVersionString(): string
                {
                    return '1.1.1.0';
                }
            };
        }

        public function getPluginPath(): string
        {
            return 'plugins/generic/keywordPasteSplitter';
        }
    }
}

namespace PKP\template {
    class PKPTemplateManager
    {
        public array $scripts = [];

        public function addJavaScript(string $id, string $url, array $options = []): void
        {
            $this->scripts[] = compact('id', 'url', 'options');
        }
    }
}

namespace APP\core {
    class Application
    {
        public static ?object $instance = null;

        public static function isUnderMaintenance(): bool
        {
            return false;
        }

        public static function get(): object
        {
            return self::$instance;
        }
    }
}

namespace {
    use APP\core\Application;
    use APP\plugins\generic\keywordPasteSplitter\KeywordPasteSplitterPlugin;
    use PKP\plugins\Hook;
    use PKP\template\PKPTemplateManager;

    require_once dirname(__DIR__) . '/KeywordPasteSplitterPlugin.php';

    function assertTrue(bool $condition, string $message): void
    {
        if (!$condition) {
            fwrite(STDERR, "FAIL: {$message}\n");
            exit(1);
        }
    }

    $context = new class {
        public function getId(): int
        {
            return 7;
        }
    };

    $request = new class($context) {
        public function __construct(private object $context)
        {
        }

        public function getContext(): object
        {
            return $this->context;
        }

        public function getBaseUrl(): string
        {
            return 'https://example.test/ojs';
        }
    };

    Application::$instance = new class($request) {
        public function __construct(private object $request)
        {
        }

        public function getRequest(): object
        {
            return $this->request;
        }
    };

    $plugin = new KeywordPasteSplitterPlugin();

    // The hook must be registered even when no journal context was available
    // during plugin registration.
    $plugin->register('generic', 'keywordPasteSplitter', null);
    assertTrue(
        in_array('TemplateManager::display', Hook::$registered, true),
        'TemplateManager::display hook was not registered without a context.'
    );

    $templateManager = new PKPTemplateManager();

    // Disabled journal: the hook exists but must not inject anything.
    $plugin->addAssets('TemplateManager::display', [$templateManager]);
    assertTrue(count($templateManager->scripts) === 0, 'Asset loaded for a disabled journal.');

    // Enabled journal: the plugin must be fully self-contained and inject its
    // browser handler through the normal PKP template asset API.
    $plugin->enabledContexts[7] = true;
    $plugin->addAssets('TemplateManager::display', [$templateManager]);
    assertTrue(count($templateManager->scripts) === 1, 'Asset was not loaded for the enabled journal.');
    assertTrue(
        $templateManager->scripts[0]['options']['contexts'] === ['backend'],
        'Asset is not restricted to the backend context.'
    );
    assertTrue(
        str_contains($templateManager->scripts[0]['url'], '/plugins/generic/keywordPasteSplitter/js/keywordPasteSplitter.js?v=1.1.1.0'),
        'Expected plugin-local JavaScript URL was not generated.'
    );

    fwrite(STDOUT, "Plugin registration regression test passed.\n");
}
