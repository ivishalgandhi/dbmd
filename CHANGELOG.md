# Change Log

All notable changes to the "DBMD: SQL Preview" extension will be documented in this file.

## [1.0.7] - 2025-11-15

### Fixed
- **Critical**: Extension not loading - included node_modules dependencies in package
- Missing runtime dependencies (@vscode/sqlite3, markdown-it, gray-matter)
- Command 'dbmd.preview' not found error

### Changed
- Updated .vscodeignore to include necessary node_modules
- Removed overly aggressive file exclusions

## [1.0.6] - 2025-11-15

### Added
- Native VS Code markdown preview integration with `markdown.markdownItPlugins`
- Chinook database examples (SQLite and DuckDB versions) - industry-standard music store database
- HTML table rendering for SQL query results in native preview
- Cross-platform path handling with automatic resolution
- DuckDB-specific SQL syntax examples (ANY_VALUE, window functions, CTEs)

### Fixed
- Native markdown preview not rendering SQL results (added markdown-it plugin)
- Document path resolution using multiple fallback strategies (env.documentPath, lastMarkdownDocument, activeTextEditor)
- DuckDB CLI integration with proper command syntax
- HTML table styling with inline CSS and proper formatting
- Cross-platform compatibility for Windows, macOS, and Linux

### Changed
- Refactored `getQueryResultHtml` to return proper HTML tables instead of markdown
- Consolidated documentation into single README.md
- Removed redundant documentation files (USAGE_GUIDE, DEPLOYMENT, TESTING_GUIDE, QUICK_START, CONTRIBUTING)
- Replaced simple test examples with professional Chinook database examples
- Cleaned up examples directory (removed population data, kept only Chinook)
- Improved error messages with better context
- Simplified npm scripts to prevent circular dependencies

## [1.0.5] - 2024-11-15

### Changed
- Switched to better-sqlite3 v11.5.0 for improved performance and reliability
- Added synchronous SQLite operations for better error handling
- Updated Node.js engine requirement to >=18.0.0
- Improved cross-platform compatibility
- Enhanced error logging and debugging capabilities

### Fixed
- Improved command visibility in Windows
- Updated command registration to match VS Code patterns
- Added enablement condition for better command control
- Changed to editorLangId for more reliable language detection
- Added onStartupFinished for better activation timing

## [1.0.4] - 2024-01-16

### Fixed
- Simplified command registration for better Windows compatibility
- Changed activation event to "*" for more reliable startup
- Updated command title and visibility conditions
- Improved error handling in command registration

## [1.0.3] - 2024-01-16

### Fixed
- Enhanced command registration for Windows compatibility
- Added onStartupFinished activation event
- Improved command visibility and enablement conditions
- Added better error handling
- Made command registration more explicit

## [1.0.2] - 2024-01-16

### Fixed
- Command registration for Windows compatibility
- Added command to activation events
- Improved command visibility with icon and menu placement

## [1.0.1] - 2024-01-16

### Fixed
- Command registration and activation
- Package dependencies handling
- Extension installation stability

## [1.0.0] - 2024-01-16

### Added
- Initial release
- Support for SQLite and DuckDB databases
- Markdown SQL query preview functionality
- Theme-aware table styling
- Configurable query visibility
- Auto-refresh on content changes
- Right-side preview panel
- Example databases and queries
- Database type configuration in frontmatter
- VS Code settings for default database type

## [0.0.1] - 2024-01-14

### Added
- Initial release
- Support for SQLite and DuckDB databases
- Markdown SQL query preview functionality
- Theme-aware table styling
- Configurable query visibility
- Auto-refresh on content changes
- Right-side preview panel
- Example databases and queries
- Database type configuration in frontmatter
- VS Code settings for default database type

For more information, visit the [GitHub repository](https://github.com/ivishalgandhi/dbmd)
