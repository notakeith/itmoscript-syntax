import * as vscode from 'vscode';

const docs: Record<string, string> = {
  function: 'Defines a function: `function name(params) ... end function`',
  if: 'Conditional: `if condition then ... end if`',
  else: 'Alternative branch: `else` inside `if`',
  'end if': 'Closes `if` block',
  while: 'Loop: `while condition ... end while`',
  'end while': 'Closes `while` block',
  for: 'For-each loop: `for item in list ... end for`',
  'end for': 'Closes `for` block',
  return: 'Returns a value from a function: `return value`',
  break: 'Exits the current loop',
  continue: 'Skips to the next loop iteration',
};

export function activate(context: vscode.ExtensionContext) {
  let interpreterPath = '';

  function updateInterpreterPath() {
    const config = vscode.workspace.getConfiguration('itmoscript');
    interpreterPath = config.get<string>('interpreterPath') || '';
  }
  updateInterpreterPath();

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('itmoscript.interpreterPath')) {
        updateInterpreterPath();
        vscode.window.showInformationMessage(
          `ITMOScript: interpreter path updated: ${interpreterPath}`
        );
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('itmoscript.runCurrent', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!interpreterPath) {
        vscode.window.showErrorMessage(
          'ITMOScript: interpreter path is not set in settings (itmoscript.interpreterPath)'
        );
        return;
      }
      if (!editor) {
        vscode.window.showErrorMessage('No active .is file to run');
        return;
      }
      const file = editor.document.fileName;
      const terminal = vscode.window.createTerminal('ITMOScript');
      terminal.show();
      terminal.sendText(`"${interpreterPath}" "${file}"`);
    })
  );

  // Hover provider
  context.subscriptions.push(
    vscode.languages.registerHoverProvider('itmoscript', {
      provideHover(document, position) {
        const range = document.getWordRangeAtPosition(position);
        if (!range) return;
        const word = document.getText(range);
        if (docs[word]) {
          return new vscode.Hover(new vscode.MarkdownString(docs[word]), range);
        }
        const text = document.getText();
        const sigRegex = new RegExp(`\\b${word}\\s*=\\s*function\\s*\\(([^)]*)\\)`, 'g');
        const match = sigRegex.exec(text);
        if (match) {
          const params = match[1].split(',').map(p => p.trim()).filter(p => p);
          const sigLabel = `**${word}(${params.join(', ')})**`;
          return new vscode.Hover(new vscode.MarkdownString(sigLabel), range);
        }
      }
    })
  );

  // Completion provider
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      'itmoscript',
      {
        provideCompletionItems() {
          return Object.keys(docs).map(label => {
            const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Keyword);
            item.detail = docs[label];
            return item;
          });
        }
      }
    )
  );

  // DocumentSymbol provider
  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider('itmoscript', {
      provideDocumentSymbols(document) {
        const symbols: vscode.SymbolInformation[] = [];
        const text = document.getText();
        const fnRegex = /([a-zA-Z_][\w]*)\s*=\s*function/gi;
        let match: RegExpExecArray | null;
        while ((match = fnRegex.exec(text))) {
          const name = match[1];
          const pos = document.positionAt(match.index);
          symbols.push(new vscode.SymbolInformation(
            name,
            vscode.SymbolKind.Function,
            '',
            new vscode.Location(document.uri, pos)
          ));
        }
        return symbols;
      }
    })
  );

  // Signature Help provider
  context.subscriptions.push(
    vscode.languages.registerSignatureHelpProvider(
      'itmoscript',
      {
        provideSignatureHelp(document, position) {
          const help = new vscode.SignatureHelp();
          const text = document.getText();
          const signatures: Record<string, vscode.SignatureInformation> = {};

          const fnRegex = /([a-zA-Z_][\w]*)\s*=\s*function\s*\(([^)]*)\)/g;
          let match: RegExpExecArray | null;
          while ((match = fnRegex.exec(text))) {
            const name = match[1];
            const params = match[2].split(',').map(p => p.trim()).filter(p => p);
            const label = `${name}(${params.join(', ')})`;
            signatures[name] = new vscode.SignatureInformation(label, `User-defined function`);
          }

          const builtins: Record<string, string> = {
            abs: 'abs(x) — absolute value',
            ceil: 'ceil(x) — round up',
            floor: 'floor(x) — round down',
            round: 'round(x) — round to nearest integer',
            sqrt: 'sqrt(x) — square root',
            rnd: 'rnd(n) — random integer from 0 to n-1',
            parse_num: 'parse_num(s) — parse string to number, nil on failure',
            to_string: 'to_string(n) — convert number to string',
            len: 'len(x) — length of string or list',
            lower: 'lower(s) — convert to lowercase',
            upper: 'upper(s) — convert to uppercase',
            split: 'split(s, delim) — split string by delimiter',
            join: 'join(list, delim) — join list into string',
            replace: 'replace(s, old, new) — replace substring',
            range: 'range(x, y, step) — list of numbers [x, y) with step',
            push: 'push(list, x) — append element to list',
            pop: 'pop(list) — remove and return last element',
            insert: 'insert(list, index, x) — insert element at index',
            remove: 'remove(list, index) — remove element at index',
            sort: 'sort(list) — sort list in place',
            print: 'print(x) — print without newline',
            println: 'println(x) — print with newline',
            read: 'read() — read a line from stdin',
            stacktrace: 'stacktrace() — return current call stack',
          };

          Object.entries(builtins).forEach(([name, doc]) => {
            signatures[name] = new vscode.SignatureInformation(`${name}(...)`, doc);
          });

          const line = document.lineAt(position.line).text;
          const callMatch = /([a-zA-Z_][\w]*)\s*\(([^)]*)$/.exec(line.substring(0, position.character));
          if (callMatch) {
            const name = callMatch[1];
            const sigInfo = signatures[name];
            if (sigInfo) {
              help.signatures = [sigInfo];
              help.activeSignature = 0;
              help.activeParameter = callMatch[2] === '' ? 0 : callMatch[2].split(',').length - 1;
            }
          }
          return help;
        }
      }, '(', ','
    )
  );
}

export function deactivate() {}
