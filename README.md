# DBMD: SQL Preview for VS Code

[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/gandhivishal.dbmd?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=gandhivishal.dbmd)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square)](#platform-support)

> Execute SQL queries and preview results directly in markdown files with support for SQLite and DuckDB databases.

![DBMD Preview](images/icon.png)

## ✨ Features

- 🎯 **Native Markdown Preview Integration** - Results appear inline with `Cmd+Shift+V` / `Ctrl+Shift+V`
- 🗂️ **Dual Database Support** - Works with both SQLite and DuckDB
- 🔄 **Live Updates** - Auto-refresh on document changes
- 📊 **HTML Table Rendering** - Beautiful, styled result tables
- 🎨 **Theme-Aware** - Adapts to VS Code light/dark themes
- ⚡ **Custom Preview Panel** - Side-by-side view with dedicated UI
- 🔧 **Configurable** - Hide/show queries, set default database types
- 🌍 **Cross-Platform** - Windows, macOS, and Linux support

## 📦 Installation

### From VS Code Marketplace

1. Open VS Code
2. Press `Ctrl+Shift+X` / `Cmd+Shift+X`
3. Search for "DBMD"
4. Click **Install**

### From VSIX File

```bash
code --install-extension dbmd-1.0.6.vsix
```

### Prerequisites

- **VS Code**: 1.85.0 or higher
- **SQLite CLI**: Pre-installed on most systems
- **DuckDB CLI** (optional): See [installation](#installing-duckdb-optional)

## 🚀 Quick Start

### 1. Create a Markdown File

Create `analysis.md`:

````markdown
---
database: ./data.db
dbType: sqlite
showQuery: false
---

# Sales Analysis

## Top Products

```sql
SELECT product_name, SUM(revenue) as total_revenue
FROM sales
GROUP BY product_name
ORDER BY total_revenue DESC
LIMIT 5;
```
````

### 2. Preview Results

**Native Preview**: Press `Cmd+Shift+V` (macOS) or `Ctrl+Shift+V` (Windows/Linux)

**Custom Panel**: `Cmd+Shift+P` → "DBMD: Preview Database Query"

## 📖 Usage

### Frontmatter Configuration

```yaml
---
database: ./path/to/database.db    # Path to database file
dbType: sqlite                     # 'sqlite' or 'duckdb'
showQuery: false                   # Show/hide SQL query in output
---
```

### Path Examples

**Relative Paths (Recommended)**
```yaml
database: ./mydata.db              # Same directory
database: ./data/mydata.db         # Subdirectory
database: ../shared/mydata.db      # Parent directory
```

**Absolute Paths**
```yaml
# Windows (use forward slashes)
database: C:/Users/Name/data.db

# macOS/Linux
database: /Users/name/data.db
database: /home/user/data.db
```

### SQL Code Blocks

````markdown
```sql
SELECT * FROM users WHERE active = 1;
```
````

Multiple queries per document supported - each renders separately.

## ⚙️ Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| `dbmd.defaultDatabaseType` | Default database type | `sqlite` |

Access via: File → Preferences → Settings → Search "DBMD"

## 📚 Examples

The `examples/` directory contains Chinook database examples (industry-standard music store with 11 tables, 275 albums, 3,503 tracks).

**SQLite** (`chinook_example.md`): Sales analysis, customer insights, aggregations  
**DuckDB** (`chinook_duckdb_example.md`): Window functions, statistical analysis, time-series

**Try it**: Press `F5` → Open example file → `Cmd+Shift+V`

## 🌍 Platform Support

| Platform | SQLite | DuckDB |
|----------|--------|--------|
| **Windows** | ✅ Pre-installed | ⚡ Optional |
| **macOS** | ✅ Pre-installed | ⚡ Optional |
| **Linux** | ✅ Usually included | ⚡ Optional |

### Installing DuckDB (Optional)

```bash
# Windows
winget install DuckDB.cli

# macOS
brew install duckdb

# Linux
sudo apt install duckdb
```

## 🔧 Development

```bash
git clone https://github.com/ivishalgandhi/dbmd.git
cd dbmd
npm install

# Test: Press F5 in VS Code to launch Extension Development Host
```

### Building & Publishing

```bash
# Package
npm run package        # Creates dbmd-<version>.vsix

# Publish to marketplace
npm run publish
```

**Prerequisites for publishing**:
1. Create [Personal Access Token](https://dev.azure.com) with Marketplace scope
2. Set token: `vsce login gandhivishal`
3. Update version in `package.json`
4. Update `CHANGELOG.md`
5. Run `npm run publish`

## 🐛 Troubleshooting

**Database File Not Found**  
→ Use forward slashes in paths: `C:/path/to/db`  
→ Save markdown file before previewing

**Tables Not Rendering**  
→ Reload window: `Cmd+R` / `Ctrl+R`  
→ Check Developer Console: Help → Toggle Developer Tools  
→ Verify CLI: `sqlite3 --version`, `duckdb --version`

**CLI Tool Not Found**  
→ Install SQLite/DuckDB (see [Platform Support](#platform-support))

## 📜 License

MIT License - see [LICENSE](LICENSE)

## 🙏 Acknowledgments

- [VS Code Extension API](https://code.visualstudio.com/api)
- [@vscode/sqlite3](https://www.npmjs.com/package/@vscode/sqlite3)
- [markdown-it](https://github.com/markdown-it/markdown-it)
- [Chinook Database](https://github.com/lerocha/chinook-database)

---

**Issues**: [GitHub](https://github.com/ivishalgandhi/dbmd/issues) | **Marketplace**: [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=gandhivishal.dbmd)
