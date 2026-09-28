const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data.json");

// Разрешаем серверу принимать JSON в POST-запросах
app.use(express.json());

// Свой промежуточный обработчик: проходит каждый запрос
app.use(function (req, res, next) {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Отдаём HTML, CSS, JS, изображения и шрифты из public
app.use(express.static(path.join(__dirname, "public")));

function readItems(callback) {
    fs.readFile(DATA_FILE, "utf8", function (err, text) {
        if (err) {
            callback(err);
            return;
        }

        try {
            const items = JSON.parse(text);
            callback(null, items);
        } catch (error) {
            callback(error);
        }
    });
}

function saveItems(items, callback) {
    fs.writeFile(DATA_FILE, JSON.stringify(items, null, 4), "utf8", callback);
}

// 1. GET /api/items — все записи
app.get("/api/items", function (req, res) {
    readItems(function (err, items) {
        if (err) {
            res.status(500).json({ error: "Не удалось прочитать данные" });
            return;
        }

        // Фильтрация через query-параметры
        let result = items;

        if (req.query.category) {
            result = result.filter(function (item) {
                return item.category.toLowerCase() === req.query.category.toLowerCase();
            });
        }

        if (req.query.title) {
            result = result.filter(function (item) {
                return item.title.toLowerCase().includes(req.query.title.toLowerCase());
            });
        }

        res.status(200).json(result);
    });
});

// 5. GET /api/items/count — количество записей
app.get("/api/items/count", function (req, res) {
    readItems(function (err, items) {
        if (err) {
            res.status(500).json({ error: "Не удалось прочитать данные" });
            return;
        }

        res.status(200).json({ count: items.length });
    });
});


// 2. GET /api/items/:id — одна запись
app.get("/api/items/:id", function (req, res) {
    readItems(function (err, items) {
        if (err) {
            res.status(500).json({ error: "Не удалось прочитать данные" });
            return;
        }

        const id = Number(req.params.id);
        const item = items.find(function (item) {
            return item.id === id;
        });

        if (!item) {
            res.status(404).json({ error: "Запись не найдена" });
            return;
        }

        res.status(200).json(item);
    });
});

// 3. GET /api/items/category/:category — фильтрация по категории
app.get("/api/items/category/:category", function (req, res) {
    readItems(function (err, items) {
        if (err) {
            res.status(500).json({ error: "Не удалось прочитать данные" });
            return;
        }

        const category = req.params.category.toLowerCase();
        const result = items.filter(function (item) {
            return item.category.toLowerCase() === category;
        });

        res.status(200).json(result);
    });
});

// 4. POST /api/items — добавление записи
app.post("/api/items", function (req, res) {
    const newItem = req.body;

    if (!newItem || !newItem.title) {
        res.status(400).json({ error: "Поле title обязательно" });
        return;
    }

    readItems(function (err, items) {
        if (err) {
            res.status(500).json({ error: "Не удалось прочитать данные" });
            return;
        }

        let maxId = 0;

        for (const item of items) {
            if (item.id > maxId) {
                maxId = item.id;
            }
        }

        newItem.id = maxId + 1;

        if (!newItem.description) newItem.description = "";
        if (!newItem.category) newItem.category = "Другое";
        if (!newItem.time) newItem.time = "Не указано";

        items.push(newItem);

        saveItems(items, function (saveError) {
            if (saveError) {
                res.status(500).json({ error: "Не удалось сохранить данные" });
                return;
            }

            res.status(201).json(newItem);
        });
    });
});

// Свой обработчик 404 для API
app.use("/api", function (req, res) {
    res.status(404).json({ error: "API маршрут не найден" });
});

// Свой обработчик 404 для страниц
app.use(function (req, res) {
    res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

app.listen(PORT, function () {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
