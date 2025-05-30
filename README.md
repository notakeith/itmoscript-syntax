# ITMOScript VSCode Extension

Расширение добавляет поддержку языка ITMOScript в Visual Studio Code:

* **Подсветка синтаксиса** (TextMate Grammar)
* **Hover** с документацией по ключевым словам и функциям
* **Completion**: автодополнение ключевых слов и встроенных (builtin) функций
* **Signature Help**: подсказки параметров для пользовательских и встроенных функций
* **CodeLens**: отображение количества параметров у пользовательских функций
* **Outline**: список пользовательских и встроенных функций
* **Run**: кнопка запуска текущего `.is` файла через внешний интерпретатор

---

## 🚀 Установка
Расширение пока доступно в виде [VSIX‑пакета](https://github.com/notakeith/itmoscript-syntax/releases/). Скачайте последний релиз и установите вручную:


```bash
# Внутри VSCode
# Откройте Extensions → «…» → Install from VSIX… → выберите itmoscript-syntax-*.vsix
```

Поддержка в официальном Marketplace появится позже.

---

## ⚙️ Конфигурация

В настройках пользователя (`settings.json`) задайте путь к вашему исполняемому интерпретатору:

```jsonc
"itmoscript.interpreterPath": "/path/to/your/itmoscript_interpreter"
```

Расширение автоматически следит за изменением этой настройки и оповещает, когда путь обновлён.

---

## 📋 Использование

1. Откройте файл с расширением `.is`
2. **Кнопка Run** появится в заголовке редактора (▶️).
3. Нажмите её — в терминале запустится:

   ```bash
   <интерпретатор> path/to/file.is
   ```

---

## ✨ Особенности

* **Hover**: описания для `if`, `while`, `for`, `function`, `print`, `len` и других.
* **Completion**: быстрый ввод ключевых слов и всех встроенных функций.
* **Signature Help**: показывает сигнатуру `func(param1, param2)` при вводе `(` и `,`.
* **CodeLens**: над объявлением функций выводит `Params: N`.
* **Outline**: функциям присвоены значки и разделение на пользовательские и builtin.

---

## 🛠️ Разработка

```bash
# Клонировать репозиторий
git clone https://github.com/yourname/itmoscript-syntax.git
cd itmoscript-syntax

# Установить зависимости
npm install

# Запустить Developer Host
code .
# Нажать Run & Debug → "Run Extension"
```

---

## 🤝 Вклад

Pull requests и идеи приветствуются! Открывайте issues и форкайте репозиторий для улучшений.

## 📄 Лицензия

[MIT © notakeith](LICENSE)
