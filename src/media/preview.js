// @ts-check

(function () {
    // @ts-ignore
    const vscode = acquireVsCodeApi();

    window.addEventListener('load', () => {
        // Add custom styles to SQL blocks
        const style = document.createElement('style');
        style.textContent = `
            .sql-preview {
                margin: 1em 0;
                padding: 1em;
                border: 1px solid #ddd;
                border-radius: 4px;
                background-color: #f8f8f8;
            }

            .sql-preview-query {
                margin-bottom: 1em;
            }

            .sql-preview-label {
                color: #666;
                font-weight: bold;
                margin-bottom: 0.5em;
            }

            .sql-preview pre {
                background-color: #fff;
                padding: 1em;
                border: 1px solid #eee;
                border-radius: 4px;
                font-family: monospace;
                white-space: pre-wrap;
                margin: 0;
            }

            .sql-preview-results table {
                width: 100%;
                border-collapse: collapse;
                background-color: #fff;
                margin-top: 0.5em;
            }

            .sql-preview-results th,
            .sql-preview-results td {
                padding: 8px;
                text-align: left;
                border: 1px solid #ddd;
            }

            .sql-preview-results th {
                background-color: #f0f0f0;
                font-weight: bold;
            }

            .sql-preview-results tr:nth-child(even) {
                background-color: #f9f9f9;
            }

            .sql-preview-error {
                border-color: #dc3545;
            }

            .sql-preview-error-message {
                color: #dc3545;
                margin-top: 0.5em;
                padding: 0.5em;
                background-color: #fff;
                border: 1px solid #dc3545;
                border-radius: 4px;
            }
        `;
        document.head.appendChild(style);

        // Create an observer to watch for changes to the preview
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = /** @type {HTMLElement} */ (node);
                            const codeBlocks = element.querySelectorAll('code.language-sql');
                            codeBlocks.forEach(enhanceSqlBlock);
                        }
                    });
                }
            });
        });

        // Start observing the document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Enhance any existing SQL blocks
        document.querySelectorAll('code.language-sql').forEach(enhanceSqlBlock);
    });

    /**
     * Enhances an SQL code block with custom styling
     * @param {HTMLElement} codeBlock
     */
    function enhanceSqlBlock(codeBlock) {
        // Check if block has already been enhanced
        if (codeBlock.parentElement?.classList.contains('sql-preview')) {
            return;
        }

        const query = codeBlock.textContent?.trim() || '';
        const preElement = codeBlock.parentElement;
        if (!preElement) return;

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'sql-preview';

        // Create query section
        const querySection = document.createElement('div');
        querySection.className = 'sql-preview-query';
        
        const queryLabel = document.createElement('div');
        queryLabel.className = 'sql-preview-label';
        queryLabel.textContent = 'SQL Query:';
        
        querySection.appendChild(queryLabel);
        querySection.appendChild(preElement.cloneNode(true));

        wrapper.appendChild(querySection);

        // Create results section
        const resultsSection = document.createElement('div');
        resultsSection.className = 'sql-preview-results';
        
        const resultsLabel = document.createElement('div');
        resultsLabel.className = 'sql-preview-label';
        resultsLabel.textContent = 'Results:';
        
        resultsSection.appendChild(resultsLabel);
        resultsSection.innerHTML += '<div>Results will appear here...</div>';

        wrapper.appendChild(resultsSection);

        // Replace the original pre element with our enhanced version
        preElement.replaceWith(wrapper);
    }
}());
