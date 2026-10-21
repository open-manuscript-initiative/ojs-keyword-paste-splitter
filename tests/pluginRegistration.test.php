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
                    return '1.1.3.0';
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

    function assertTrue(bool $condition, string $message): void
    {
        if (!$condition) {
            fwrite(STDERR, "FAIL: {$message}\n");
            exit(1);
        }
    }

    $context = new class {
        public function getId(): int { return 7; }
    };
    $request = new class($context) {
        public function __construct(private ?object $context) {}
        public function getContext(): ?object { return $this->context; }
        public function setContext(?object $context): void { $this->context = $context; }
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

    // Exercise the same plugin entry point OJS includes when the namespaced
    // class is not already autoloaded. This must work without any external
    // bootstrap/helper PHP file in the OJS installation root.
    $plugin = include dirname(__DIR__) . '/index.php';

    assertTrue(
        $plugin instanceof KeywordPasteSplitterPlugin,
        'Plugin entry point did not load and return KeywordPasteSplitterPlugin.'
    );

    // OJS can register a plugin without a resolved journal context.
    $plugin->register('generic', 'plugins/generic/keywordPasteSplitter', null);
    assertTrue(
        in_array('TemplateManager::display', Hook::$registered, true),
        'Enabled plugin did not register TemplateManager::display.'
    );

    $templateManager = new PKPTemplateManager();
    $plugin->addAssets('TemplateManager::display', [$templateManager]);
    assertTrue(count($templateManager->scripts) === 0, 'Disabled journal loaded script.');
    $plugin->enabledContexts[7] = true;
    $plugin->addAssets('TemplateManager::display', [$templateManager]);
    assertTrue(count($templateManager->scripts) === 1, 'Keyword handler asset was not registered.');
    assertTrue(
        $templateManager->scripts[0]['options']['contexts'] === ['backend'],
        'Keyword handler asset is not restricted to the backend context.'
    );
    assertTrue(
        str_contains(
            $templateManager->scripts[0]['url'],
            '/plugins/generic/keywordPasteSplitter/js/keywordPasteSplitter.js?v=1.1.3.0'
        ),
        'Expected plugin-local JavaScript URL was not generated.'
    );

    $request->setContext(null);
    $plugin->addAssets('TemplateManager::display', [$templateManager]);
    assertTrue(count($templateManager->scripts) === 1, 'Missing journal context loaded script.');

    fwrite(STDOUT, "Self-contained plugin entry-point regression test passed.\n");
}
