# Tower fetch

Simple and easy-to-use [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) wrapper

Other languages: [Russian](https://github.com/SVAYEX/tower-fetch/tree/master/langs/ru.md)

## Instalation

```sh
npm i tower-fetch
```

## Usage

Basic usage:

```js
import { tower } from "tower-fetch";

// Root instance
const $api = tower("https://my-api.com", {
  mode: "cors",
  credentials: "include"
});

// User creating
$api.post("/users", { name: "Luka", login: "SX3" });

// Getting a user
$api.get("/users/1").then(user => {
  // ...
});
```

### Extension of the instance

```js
const $api = tower("https://my-api.com", {
  mode: "cors",
  credentials: "include"
});

const $users = $api.up("users"); // https://my-api.com/users

// Post
$users.post({ name: "Luka", login: "SX3" });

// Get
$users.get("1");
```

### Unlimited extension

```js
const $base = tower("https://my-api.com");

const $one = $base.up("one"); // https://my-api.com/one

const $two = $one.up("two"); // https://my-api.com/one/two

const $three = $two.up("three", { headers: {} }); // https://my-api.com/one/two/three
```

### Edit instance

```js

const $base = tower("https://my-api.com");

const $base.edit({ headers: {
  Authorization: "TOKEN"
}}, 'https://new-api.com')

```

### Remove header

```js
const $base = tower("https://my-api.com");

// The content type header will be removed
$base.post("/files", {
  headers: {
    "Content-Type": null
  }
});
```

### Data format

Default, Tower parses data as JSON but you can configure it using `responseAs`:

```js
// Configuration of type on root instance
const $api = tower("https://my-api.com", {
  responseAs: "response" // Return Response object
});

// Extension configuration
const $users = $api.up("users", {
  responseAs: "json"
});

// Change type of one request
$users.get("1", {
  responseAs: "text"
});
```

Available data formats:

- `json` - by default.
- `text`
- `blob`
- `arrayBuffer`
- `formData`
- `response` - data aren't processed.

### Request instance

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

  // Succeed request
  then: user => {
    // ...
  },

  // Handling an error
  catch: error => {
    // ...
  },

  // Speed limit in ms
  rateLimit: 60000,

  // Counting only succeed requests
  rateOnlySuccess: true,

  // Handle rate limin
  rateLimitHadler: remainingTime => {
    console.warn(`Please wait ${Math.round(remainingTime / 1000)} seconds`);
  }

  options: {
    // Request options
  }
});

// You can assign to pressing button
updateUser()
```
