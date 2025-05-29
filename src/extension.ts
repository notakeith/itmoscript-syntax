import * as vscode from 'vscode';

const docs: Record<string, string> = {
  function: 'Определяет функцию: `function имя(params) ... end function`',
  if: 'Условная конструкция: `if условие then ... end if`',
  else: 'Альтернативная ветка: `else` в сочетании с `if`',
  'end if': 'Завершение условной конструкции: `end if`',
  while: 'Цикл: `while условие ... end while`',
  'end while': 'Завершение цикла `while`',
  for: 'Цикл по элементам: `for элемент in список ... end for`',
  'end for': 'Завершение цикла `for`',
  return: 'Возврат значения из функции: `return значение`',
  break: 'Выход из цикла: `break`',
  continue: 'Переход к следующей итерации цикла: `continue`',
};

export function activate(context: vscode.ExtensionContext) {
  console.log('ITMOScript extension activated');

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
        `ITMOScript: путь к интерпретатору обновлен: ${interpreterPath}`
      );
    }
  })
);


  context.subscriptions.push(
    vscode.commands.registerCommand('itmoscript.runCurrent', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!interpreterPath) {
        vscode.window.showErrorMessage(
          'ITMOScript: путь к интерпретатору не установлен в настройках'
        );
        return;
      }
      if (!editor) {
        vscode.window.showErrorMessage('Нет открытого .is файла для запуска');
        return;
      }
      const file = editor.document.fileName;
      const terminal = vscode.window.createTerminal('ITMOScript');
      terminal.show();
      terminal.sendText(`${interpreterPath} ${file}`);
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
        const sigRegex = new RegExp(`\b${word}\s*=\s*function\s*\(([^)]*)\)`, 'g');
        const match = sigRegex.exec(text);
        if (match) {
          const params = match[1].split(',').map(p=>p.trim()).filter(p=>p);
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
            const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Function);
            item.detail = docs[label];
            return item;
          });
        }
      }, ' ')
  );

  // CodeLens provider
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider('itmoscript', {
      provideCodeLenses(document) {
        const lenses: vscode.CodeLens[] = [];
        const regex = /([a-zA-Z_][\w]*)\s*=\s*function\s*\(([^)]*)\)/g;
        const text = document.getText();
        let match: RegExpExecArray | null;
        while ((match = regex.exec(text))) {
          const paramsCount = match[2].split(',').map(p => p.trim()).filter(p => p).length;
          const pos = document.positionAt(match.index);
          const line = document.lineAt(pos.line);
          lenses.push(new vscode.CodeLens(line.range, {
            title: `Params: ${paramsCount}`,
            command: 'itmoscript.showParams',
            arguments: []
          }));
        }
        return lenses;
      }
    })
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
          symbols.push(new vscode.SymbolInformation(name, vscode.SymbolKind.Function, '', new vscode.Location(document.uri, pos)));
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
            const params = match[2].split(',').map(p=>p.trim()).filter(p=>p);
            const label = `${name}(${params.join(', ')})`;
            signatures[name] = new vscode.SignatureInformation(label, `User-defined function ${name}`);
          }
          Object.entries({
            abs:'abs(x) - абсолютное значение',
            ceil: 'ceil(x) - округление вверх',
            floor: 'floor(x) - округление вниз',
            round: 'round(x) - округление до ближайшего целого',
            sqrt: 'sqrt(x) - квадратный корень',
            rnd: 'rnd(n) - случайное целое от 0 до n-1',
            parse_num: 'parse_num(s) - преобразует строку в число если возможно, иначе nil',
            to_string: 'to_string(n) - преобразует число в строку',
            len: 'len(s) - длина строки\nlen(list) - длина списка',
            lower: 'lower(s) - в нижний регистр',
            upper: 'upper(s) - в верхний регистр',
            split: 'split(s, delim) - разделение строки',
            join: 'join(list, delim) - объединение списка в строку',
            replace: 'replace(s, old, new) - замена подстроки',
            range: 'range(x, y, step) - возвращает список чисел [x; y) с шагом step',
            push: 'push(list, x) - добавить элемент в конец',
            pop: 'pop(list) - удалить и вернуть последний элемент',
            inser: 'insert(list, index, x) - вставить элемент',
            remove: 'remove(list, index) - удалить элемент',
            sort: 'sort(list) - сортировка',
            print: 'print(x) - вывод в поток вывода без дополнительных символов и перевода строки',
            println: 'println(x) - вывод в поток вывода с последующим переводом строки',
            read: 'read() - читает и возвращает строку из потока ввода',
            stacktrace: 'stacktrace() - возвращает текущий стэк вызова функций'
          }).forEach(([name, doc]) => {
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
      }, '(', ',')
  );
}

export function deactivate() {}