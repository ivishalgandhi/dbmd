# Change Log

All notable changes to the "DBMD: SQL Preview" extension will be documented in this file.

## [1.0.5] - 2024-01-16

### Fixed
- Switched to @vscode/sqlite3 for better Windows compatibility
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