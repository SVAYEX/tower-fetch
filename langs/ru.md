# Tower fetch

Простая и лёгкая обёртка над [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

## Установка

```sh
npm i tower-fetch
```

## Использавание

Базовый сценарий:

```js
import { tower } from "tower-fetch";

// Базовый инстанс
const $api = tower("https://my-api.com", {
  mode: "cors",
  credentials: "include"
});

// Создание пользователя
$api.post("/users", { name: "Luka", login: "SX3" });

// Получить пользователя
$api.get("/users/1").then(user => {
  // ...
});
```

### Наращивание

```js
const $api = tower("https://my-api.com", {
  mode: "cors",
  credentials: "include"
});

const $users = $api.up("users"); // https://my-api.com/users

// Создать
$users.post({ name: "Luka", login: "SX3" });

// Получить
$users.get("1");
```

Наращивать можно до бесконечности:

```js
const $base = tower("https://my-api.com");

const $one = $base.up("one"); // https://my-api.com/one

const $two = $one.up("two"); // https://my-api.com/one/two

const $three = $two.up("three"); // https://my-api.com/one/two/three
```

### Формат возвращаемых данных

По умолчанию Tower парсит данные как JSON, но вы можете изменить это указав `responseAs`:

```js
// Смена типа по умолчанию
const $api = tower("https://my-api.com", {
  responseAs: "response" // Возвратит объект Response
});

// Смена типа при наращивании
const $users = $api.up("users", {
  responseAs: "json"
});

// Смена типа для одного запроса
$users.get("1", {
  responseAs: "text"
});
```

Доступные типы данных:

- `json` - по умолчанию.
- `text`
- `blob`
- `arrayBuffer`
- `formData`
- `response` - данные не будут обрабатываться.

### Экземпляр запроса

```js
const $fetch = tower("https://my-api.com");

const userId = 1;

const updateUser = $fetch.request({
  // string | () => string
  url: () => `/users/${userId}`,

  // string
  method: "PATCH",

  // RequestData | () => RequestData
  data: () => ({
    name: "Luka"
  }),

  // Успешный запрос
  then: user => {
    // ...
  },

  // Ошибка
  catch: error => {
    // ...
  },

  // Ограничение скорости в ms
  rateLimit: 60000,

  // Считать только успешные запросы
  rateOnlySuccess: true,

  // Обработчик при превешении лимита
  rateLimitHadler: remainingTime => {
    console.warn(`Please wait ${Math.round(remainingTime / 1000)} seconds`);
  }

  options: {
    // Опции запроса
  }
});

// Можно назначить на нажатие кнопки
updateUser()
```
