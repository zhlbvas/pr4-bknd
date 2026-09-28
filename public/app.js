const loading = document.getElementById("loading");
const error = document.getElementById("error");
const empty = document.getElementById("empty");
const places = document.getElementById("places");

function createCards(data) {
    places.innerHTML = "";

    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <h2>${item.title}</h2>
            <p>${item.description}</p>
            <p><b>Категория:</b> ${item.category}</p>
            <p><b>Время посещения:</b> ${item.time}</p>
            <button onclick="showPlace('${item.title}')">Подробнее</button>
        `;

        places.appendChild(card);
    });
}

async function loadData() {
    loading.style.display = "block";
    error.style.display = "none";
    empty.style.display = "none";

    try {
        // Данные теперь получаем со своего Express-сервера
        const response = await fetch("/api/items");

        if (!response.ok) {
            throw new Error("Ошибка загрузки данных");
        }

        const data = await response.json();

        loading.style.display = "none";

        if (data.length === 0) {
            empty.textContent = "К сожалению, места для посещения не найдены.";
            empty.style.display = "block";
            return;
        }

        

        createCards(data);

    } catch (err) {
        loading.style.display = "none";
        error.textContent = "Не удалось загрузить данные. Попробуйте ещё раз.";
        error.style.display = "block";
        console.log(err);
    }

}

function showPlace(title) {
    alert("Вы выбрали: " + title);
}

loadData();
