# Change Log

All notable changes to the "DBMD: SQL Preview" extension will be documented in this file.

## [Unreleased]

### Added
- Native VS Code markdown preview integration with `markdown.markdownItPlugins`
- HTML table rendering for SQL query results
- Cross-platform path handling with automatic resolution
- Comprehensive documentation suite (README, USAGE_GUIDE, DEPLOYMENT, CONTRIBUTING)
- Improved npm scripts for build, package, and publish workflows
- Clean and reinstall scripts for development
- Enhanced .vscodeignore for cleaner packages
- Platform-specific installation and usage guides

### Fixed
- Native markdown preview not rendering SQL results (added markdown-it plugin)
- Document path resolution using multiple fallback strategies
- DuckDB CLI integration with proper command syntax
- HTML table styling with borders and proper formatting
- Cross-platform compatibility for Windows, macOS, and Linux

### Changed
- Refactored `getQueryResultHtml` to return proper HTML tables instead of markdown
- Improved error messages with better context
- Updated package.json with enhanced scripts and metadata
- Professional documentation following FAANG standards

## [1.0.6] - 2024-01-16

### Added
- Cross-platform SQLite support using @vscode/sqlite3
- Enhanced error logging and debugging capabilities
- Improved database connection reliability

### Changed
- Switched to @vscode/sqlite3 v5.1.8 for better platform compatibility
- Updated SQLite implementation to use callback-based API
- Simplified command title to "Preview" under DBMD category
- Improved error messages for better user experience

### Fixed
- Cross-platform compatibility issues on Windows and macOS
- SQLite database connection reliability
- Command visibility in VS Code command palette

### Security
- Enforced read-only database access
- Enhanced secure file path handling
- Improved error message sanitization

## [1.0.5] - 2024-01-16

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
