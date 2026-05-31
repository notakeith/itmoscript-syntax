# ITMOScript Support

> [English version](README.md)

[![VSCode](https://img.shields.io/badge/VSCode-1.75%2B-007ACC?logo=visualstudiocode&logoColor=white)](https://code.visualstudio.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Расширение VSCode для [ITMOScript](https://github.com/notakeith/itmoscript) — подсветка синтаксиса, документация при наведении, автодополнение, подсказки параметров, структура файла и запуск в один клик.

## Возможности

- **Подсветка синтаксиса** — ключевые слова, константы (`true`, `false`, `nil`), встроенные функции, строки, числа, комментарии
- **Hover-документация** — описания ключевых слов и встроенных функций при наведении
- **Автодополнение** — подсказки ключевых слов через IntelliSense
- **Signature help** — подсказки параметров для встроенных и пользовательских функций при вводе `(` или `,`
- **Outline** — список всех пользовательских функций в боковой панели проводника
- **Запуск** — кнопка ▶ в заголовке редактора запускает текущий `.is` файл через локальный интерпретатор

## Скриншоты

<!-- Добавьте скриншоты сюда -->

## Установка

Расширение распространяется в виде VSIX-пакета. Скачайте последний релиз из [Releases](https://github.com/notakeith/itmoscript-syntax/releases/) и установите вручную:

1. Откройте VSCode
2. Перейдите в **Extensions** → **⋯** → **Install from VSIX…**
3. Выберите скачанный `itmoscript-syntax-*.vsix`

## Конфигурация

Укажите путь к интерпретатору ITMOScript в `settings.json`:

```jsonc
"itmoscript.interpreterPath": "/путь/до/itmoscript"
```

Расширение отслеживает изменения этой настройки и уведомляет при обновлении.

## Сборка

```bash
git clone https://github.com/notakeith/itmoscript-syntax.git
cd itmoscript-syntax
npm install
npm run compile
```

Для запуска хоста расширения: откройте проект в VSCode и нажмите **F5**.
