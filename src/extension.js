const vscode = require('vscode');
const matter = require('gray-matter');
const sqlite3 = require('@vscode/sqlite3').verbose();
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
            try {
                console.log('Attempting to connect to SQLite database:', dbPath);
                const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
                    if (err) {
                        console.error('SQLite connection error:', err);
                        reject(err);
                    } else {
                        console.log('Successfully connected to SQLite database');
                        resolve(db);
                    }
                });
            } catch (error) {
                console.error('Error in SQLite connect:', error);
                reject(error);
            }
        }),
        query: (db, sql) => new Promise((resolve, reject) => {
            try {
                console.log('Executing SQLite query:', sql);
                db.all(sql, [], (err, rows) => {
                    if (err) {
                        console.error('SQLite query error:', err);
                        reject(err);
                    } else {
                        console.log('Query executed successfully, rows:', rows?.length);
                        resolve(rows);
                    }
                });
            } catch (error) {
                console.error('Error in SQLite query:', error);
                reject(error);
            }
        }),
        close: (db) => new Promise((resolve, reject) => {
            try {
                if (db) {
                    db.close((err) => {
                        if (err) {
                            console.error('SQLite close error:', err);
                            reject(err);
                        } else {
                            console.log('SQLite connection closed successfully');
                            resolve();
                        }
                    });
                } else {
                    resolve();
                }
            } catch (error) {
                console.error('Error in SQLite close:', error);
                reject(error);
            }
        })
    },
    duckdb: {
        connect: async (dbPath) => dbPath,
        query: async (dbPath, sql) => {
            try {
                console.log('Executing DuckDB query:', sql);
                const result = execSync(
                    `duckdb "${dbPath}" -json -c "${sql.replace(/"/g, '\\"')}"`,
                    { encoding: 'utf8' }
                );
                return JSON.parse(result);
            } catch (error) {
                console.error('DuckDB query error:', error);
                throw new Error(error.stderr || error.message);
            }
        },
        close: async () => {}
    }
};

async function activate(context) {
    console.log('Markdown SQL Preview is now active');

    let currentPanel = null;
    let currentDocument = null;
    let changeDocumentSubscription = null;
    let changeEditorSubscription = null;
    let lastMarkdownDocument = null; // Track last markdown document for native preview

    // Track active markdown documents
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && editor.document.languageId === 'markdown') {
            lastMarkdownDocument = editor.document;
        }
    });

    // Initialize with current editor if it's markdown
    if (vscode.window.activeTextEditor?.document.languageId === 'markdown') {
        lastMarkdownDocument = vscode.window.activeTextEditor.document;
    }

    // Register the preview command
    const previewCommand = vscode.commands.registerCommand('dbmd.preview', async () => {
        try {
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

            await updatePreview(styleUri);

            // Watch for changes in the document
            if (changeDocumentSubscription) {
                changeDocumentSubscription.dispose();
            }
            changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(async e => {
                if (currentDocument && e.document === currentDocument) {
                    await updatePreview(styleUri);
                }
            });

            // Watch for active editor changes
            if (changeEditorSubscription) {
                changeEditorSubscription.dispose();
            }
            changeEditorSubscription = vscode.window.onDidChangeActiveTextEditor(async editor => {
                if (editor && editor.document.languageId === 'markdown') {
                    currentDocument = editor.document;
                    await updatePreview(styleUri);
                }
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error.message}`);
            console.error(error);
        }
    });

    // Register command and set context
    context.subscriptions.push(previewCommand);
    await vscode.commands.executeCommand('setContext', 'markdownPreviewEnabled', true);
    await vscode.commands.executeCommand('setContext', 'markdown-preview-mode', true);

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
                        
                        // Try multiple ways to get document path
                        let documentPath = env.documentPath;
                        
                        // Fallback to lastMarkdownDocument if env.documentPath not available
                        if (!documentPath && lastMarkdownDocument) {
                            documentPath = lastMarkdownDocument.uri.fsPath;
                        }
                        
                        // Another fallback: try to get from workspace
                        if (!documentPath) {
                            const editor = vscode.window.activeTextEditor;
                            if (editor?.document.languageId === 'markdown') {
                                documentPath = editor.document.uri.fsPath;
                            }
                        }
                        
                        if (!documentPath) {
                            return `<div class="sql-preview-error">Cannot determine document path. Please save your markdown file first.</div>`;
                        }

                        // Read frontmatter from the document
                        const documentContent = fs.readFileSync(documentPath, 'utf8');
                        const { data: frontMatter } = matter(documentContent);

                        if (!frontMatter.database) {
                            return `<div class="sql-preview-error">No database path specified in frontmatter</div>`;
                        }

                        const dbPath = path.resolve(path.dirname(documentPath), frontMatter.database);
                        if (!fs.existsSync(dbPath)) {
                            return `<div class="sql-preview-error">Database file not found: ${dbPath}</div>`;
                        }

                        // Determine database type
                        const dbType = frontMatter.dbType || vscode.workspace.getConfiguration('dbmd').get('defaultDatabaseType') || 'sqlite';
                        
                        // Execute query synchronously using CLI
                        let results;
                        if (dbType === 'duckdb') {
                            results = execSync(
                                `duckdb "${dbPath}" -json -c "${query.replace(/"/g, '\\"')}"`,
                                { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
                            );
                        } else {
                            // SQLite
                            results = execSync(
                                `sqlite3 -json "${dbPath}" "${query.replace(/"/g, '\\"')}"`,
                                { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
                            );
                        }

                        let rows;
                        try {
                            rows = JSON.parse(results);
                            if (!Array.isArray(rows)) {
                                rows = [];
                            }
                        } catch (e) {
                            // Fallback for non-JSON output
                            rows = results.trim().split('\n').filter(line => line.length > 0).map(line => ({
                                result: line
                            }));
                        }

                        return getQueryResultHtml({ query, rows, showQuery: frontMatter.showQuery });
                    } catch (error) {
                        const errorMessage = error.stderr || error.message || String(error);
                        return getQueryResultHtml({ query: token.content, error: errorMessage });
                    }
                }
                return fence(tokens, idx, options, env, self);
            };

            return md;
        }
    };
}

function getQueryResultHtml(result) {
    // Escape HTML special characters
    const escapeHtml = (str) => {
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    };

    // Only show query if showQuery is explicitly true
    const showQuery = result.showQuery === true;

    let html = '<div class="sql-preview">';
    
    if (showQuery) {
        html += `<div class="sql-preview-query"><h4>Query:</h4><pre><code class="language-sql">${escapeHtml(result.query)}</code></pre></div>`;
    }
    
    if (result.error) {
        html += `<div class="sql-preview-error" style="color: #f14c4c; padding: 10px; border-left: 3px solid #f14c4c; background: rgba(241, 76, 76, 0.1);"><strong>Error:</strong> ${escapeHtml(result.error)}</div>`;
    } else if (result.rows && result.rows.length > 0) {
        // Generate HTML table
        const headers = Object.keys(result.rows[0]);
        html += '<table style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
        html += '<thead><tr>';
        headers.forEach(header => {
            html += `<th style="border: 1px solid #424242; padding: 8px; background: #1e1e1e; text-align: left;">${escapeHtml(String(header))}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        result.rows.forEach(row => {
            html += '<tr>';
            Object.values(row).forEach(value => {
                const displayValue = value === null ? 'NULL' : String(value);
                html += `<td style="border: 1px solid #424242; padding: 8px;">${escapeHtml(displayValue)}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
    } else {
        html += '<p style="color: #888; font-style: italic;">No results</p>';
    }
    
    html += '</div>';
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
