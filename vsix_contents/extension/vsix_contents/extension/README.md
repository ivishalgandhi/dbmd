# DBMD: SQL Preview Extension for VS Code

Preview SQL query results directly in your markdown files. Supports both SQLite and DuckDB databases.

## Features

- Preview SQL query results inline with your markdown content
- Support for both SQLite and DuckDB databases
- Automatic refresh on content changes
- Configurable query visibility
- Theme-aware styling

## Usage

1. Create a markdown file with SQL queries in code blocks
2. Add database configuration in frontmatter:
   ```yaml
   ---
   database: ./path/to/your.db
   dbType: sqlite  # or 'duckdb'
   showQuery: false  # optional, defaults to true
   ---
   ```
3. Write SQL queries in code blocks:
   ````markdown
   ```sql
   SELECT * FROM your_table;
   ```
   ````
4. Use the command "DBMD: Preview" or press `Cmd+Shift+P` and search for "DBMD: Preview"

## Requirements

- VS Code 1.85.0 or higher
- SQLite (built-in)
- DuckDB CLI (optional, for DuckDB support)

## Extension Settings

- `dbmd.defaultDatabaseType`: Set default database type (`sqlite` or `duckdb`)

## Examples

Check the `examples` folder in the repository for:
- SQLite example with population data
- DuckDB example with advanced analytics
- Sample database and initialization scripts

## License

MIT License - see LICENSE file for details
