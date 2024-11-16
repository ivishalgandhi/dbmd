const vscode = require('vscode');
const matter = require('gray-matter');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const markdownIt = require('markdown-it')({
    html: true,
    breaks: true,
    linkify: true
});

// Database connection handlers
const dbHandlers = {
    sqlite: {
        connect: (dbPath) => new Promise((resolve, reject) => {
            const db = new sqlite3.Database(dbPath, (err) => {
                if (err) reject(err);
                else resolve(db);
            });
        }),
        query: (db, sql) => new Promise((resolve, reject) => {
            db.all(sql, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        }),
        close: (db) => new Promise((resolve, reject) => {
            db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        })
    },
    duckdb: {
        connect: async (dbPath) => dbPath, // Just return the path for CLI usage
        query: async (dbPath, sql) => {
            try {
                const result = execSync(
                    `duckdb "${dbPath}" -json -c "${sql.replace(/"/g, '\\"')}"`,
                    { encoding: 'utf8' }
                );
                return JSON.parse(result);
            } catch (error) {
                throw new Error(error.stderr || error.message);
            }
        },
        close: async () => {} // No need to close for CLI
    }
};

function activate(context) {
    console.log('Markdown SQL Preview is now active');

    let currentPanel = null;
    let currentDocument = null;
    let changeDocumentSubscription = null;
    let changeEditorSubscription = null;

    // Register the preview command
    let disposable = vscode.commands.registerCommand('dbmd.preview', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'markdown') {
            vscode.window.showErrorMessage('Please open a markdown file to preview SQL results.');
            return;
        }

        currentDocument = editor.document;

        if (currentPanel) {
            currentPanel.reveal(vscode.ViewColumn.Beside);
        } else {
            currentPanel = vscode.window.createWebviewPanel(
                'sqlPreview',
                'SQL Preview',
                vscode.ViewColumn.Beside,
                {
                    enableScripts: true,
                    localResourceRoots: [
                        vscode.Uri.file(path.join(context.extensionPath, 'styles'))
                    ]
                }
            );

            currentPanel.onDidDispose(() => {
                currentPanel = null;
                if (changeDocumentSubscription) {
                    changeDocumentSubscription.dispose();
                }
                if (changeEditorSubscription) {
                    changeEditorSubscription.dispose();
                }
            });
        }

        // Create URI for stylesheet
        const styleUri = currentPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(context.extensionPath, 'styles', 'preview.css'))
        );

        updatePreview(styleUri);

        // Watch for changes in the document
        if (changeDocumentSubscription) {
            changeDocumentSubscription.dispose();
        }
        changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (currentDocument && e.document === currentDocument) {
                updatePreview(styleUri);
            }
        });

        // Watch for active editor changes
        if (changeEditorSubscription) {
            changeEditorSubscription.dispose();
        }
        changeEditorSubscription = vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && editor.document.languageId === 'markdown') {
                currentDocument = editor.document;
                updatePreview(styleUri);
            }
        });
    });

    context.subscriptions.push(disposable);

    // Function to update preview content
    async function updatePreview(styleUri) {
        if (!currentPanel || !currentDocument) return;

        try {
            const content = currentDocument.getText();
            const { data: frontMatter, content: markdownContent } = matter(content);

            if (!frontMatter.database) {
                currentPanel.webview.html = getWebviewContent('Error: No database path specified in frontmatter', [], markdownContent, styleUri);
                return;
            }

            const dbPath = path.resolve(path.dirname(currentDocument.uri.fsPath), frontMatter.database);
            if (!fs.existsSync(dbPath)) {
                currentPanel.webview.html = getWebviewContent(`Error: Database file not found: ${dbPath}`, [], markdownContent, styleUri);
                return;
            }

            // Determine database type
            const dbType = frontMatter.dbType || vscode.workspace.getConfiguration('markdown-sql-preview').get('defaultDatabaseType') || 'sqlite';
            if (!dbHandlers[dbType]) {
                currentPanel.webview.html = getWebviewContent(`Error: Unsupported database type: ${dbType}`, [], markdownContent, styleUri);
                return;
            }

            const handler = dbHandlers[dbType];
            const db = await handler.connect(dbPath);

            // Find SQL code blocks and replace them with results
            let processedContent = markdownContent;
            const regex = /```sql\n([\s\S]*?)\n```/g;
            let match;
            const sqlBlocks = [];
            const results = [];

            while ((match = regex.exec(markdownContent)) !== null) {
                sqlBlocks.push({
                    query: match[1].trim(),
                    start: match.index,
                    end: match.index + match[0].length,
                    originalText: match[0]
                });
            }

            // Process SQL blocks in reverse order to maintain correct positions
            for (const block of sqlBlocks.reverse()) {
                try {
                    const rows = await handler.query(db, block.query);
                    const resultHtml = getQueryResultHtml({ 
                        query: block.query, 
                        rows,
                        showQuery: frontMatter.showQuery 
                    });
                    processedContent = 
                        processedContent.substring(0, block.start) +
                        resultHtml +
                        processedContent.substring(block.end);
                } catch (err) {
                    const errorHtml = getQueryResultHtml({ 
                        query: block.query, 
                        error: err.message,
                        showQuery: frontMatter.showQuery 
                    });
                    processedContent = 
                        processedContent.substring(0, block.start) +
                        errorHtml +
                        processedContent.substring(block.end);
                }
            }

            await handler.close(db);

            // Process the content as markdown
            const renderedContent = markdownIt.render(processedContent);
            const finalHtml = `<div class="markdown-content">${renderedContent}</div>`;
            currentPanel.webview.html = getWebviewContent(null, results, finalHtml, styleUri);

        } catch (err) {
            currentPanel.webview.html = getWebviewContent(`Error: ${err.message}`, [], '', styleUri);
        }
    }

    // Debounce function to prevent too frequent updates
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Debounced update function
    const debouncedUpdate = debounce(updatePreview, 500);

    // Register markdown-it plugin for native preview
    return {
        extendMarkdownIt(md) {
            const fence = md.renderer.rules.fence.bind(md.renderer.rules);
            md.renderer.rules.fence = (tokens, idx, options, env, self) => {
                const token = tokens[idx];
                if (token.info === 'sql') {
                    try {
                        const query = token.content.trim();
                        const document = vscode.window.activeTextEditor?.document;
                        
                        if (!document) {
                            return `<div class="sql-preview-error">No active document</div>`;
                        }

                        const content = document.getText();
                        const { data: frontMatter } = matter(content);

                        if (!frontMatter.database) {
                            return `<div class="sql-preview-error">No database path specified in frontmatter</div>`;
                        }

                        const dbPath = path.resolve(path.dirname(document.uri.fsPath), frontMatter.database);
                        if (!fs.existsSync(dbPath)) {
                            return `<div class="sql-preview-error">Database file not found: ${dbPath}</div>`;
                        }

                        // Determine database type
                        const dbType = frontMatter.dbType || vscode.workspace.getConfiguration('markdown-sql-preview').get('defaultDatabaseType') || 'sqlite';
                        if (!dbHandlers[dbType]) {
                            return `<div class="sql-preview-error">Unsupported database type: ${dbType}</div>`;
                        }

                        const handler = dbHandlers[dbType];
                        const db = handler.connect(dbPath);

                        // Execute query synchronously using sqlite3 CLI
                        const execSync = require('child_process').execSync;
                        const results = execSync(
                            `sqlite3 -json "${dbPath}" "${query.replace(/"/g, '\\"')}"`,
                            { encoding: 'utf8' }
                        );

                        let rows;
                        try {
                            rows = JSON.parse(results);
                            if (!Array.isArray(rows)) {
                                rows = [];
                            }
                        } catch (e) {
                            rows = results.trim().split('\n').filter(line => line.length > 0).map(line => ({
                                result: line
                            }));
                        }

                        return getQueryResultHtml({ query, rows });
                    } catch (error) {
                        return getQueryResultHtml({ query: token.content, error: error.message });
                    }
                }
                return fence(tokens, idx, options, env, self);
            };

            return md;
        }
    };
}

function getQueryResultHtml(result) {
    // Escape any markdown special characters in the HTML
    const escapeMarkdown = (str) => {
        return str.replace(/[_*[\]()]/g, '\\$&');
    };

    // Only show query if showQuery is explicitly true
    const showQuery = result.showQuery === true;

    const html = `
<div class="sql-preview">
${showQuery ? `
<div class="sql-preview-query">

#### Query:
\`\`\`sql
${result.query}
\`\`\`
</div>

` : ''}
${result.error ? 
    `<div class="sql-preview-error">

**Error:** ${escapeMarkdown(result.error)}

</div>

` :
    result.rows && result.rows.length > 0 ? `
<div class="sql-preview-results">

| ${Object.keys(result.rows[0]).join(' | ')} |
| ${Object.keys(result.rows[0]).map(() => '---').join(' | ')} |
${result.rows.map(row => 
    `| ${Object.values(row).map(value => escapeMarkdown(String(value === null ? 'NULL' : value))).join(' | ')} |`
).join('\n')}

</div>

` : `
<p>No results</p>

`}
</div>

`;
    return html;
}

function getWebviewContent(error, results, renderedContent, styleUri, showQuery) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" type="text/css" href="${styleUri}">
        <title>SQL Preview</title>
    </head>
    <body>
        <div class="preview-header">
            <button class="refresh-button" onclick="refreshPreview()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M14.9 8c0-3.9-3.1-7-7-7s-7 3.1-7 7c0 3.9 3.1 7 7 7v-2c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5h-2l3 3 3-3h-2z"/>
                </svg>
                Refresh
            </button>
        </div>
        <div class="markdown-content">
            ${error ? `<div class="sql-preview-error">${error}</div>` : ''}
            ${renderedContent}
        </div>
        <script>
            const vscode = acquireVsCodeApi();
            
            function refreshPreview() {
                vscode.postMessage({ command: 'refresh' });
            }

            // Handle messages from the extension
            window.addEventListener('message', event => {
                const message = event.data;
                switch (message.command) {
                    case 'update':
                        // Handle any update-specific logic here
                        break;
                }
            });
        </script>
    </body>
    </html>`;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
