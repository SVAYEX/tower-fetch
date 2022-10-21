import { tower, merge } from "./src";

export default {};

const app = document.querySelector("#app");
if (!app) throw new Error("App element invalid");
const btn = document.createElement("button");
btn.textContent = "Simple requests!";
app.appendChild(btn);

const $fetch = tower("https://jsonplaceholder.typicode.com");

//const $todos = $fetch.up("/todos");
const $posts = $fetch.up("/posts");

const userId = 1;

const $updateUser = $fetch.request({
  url: () => `/users/${userId}`,
  method: "PATCH",
  data: () => ({
    name: "Luka"
  }),
  then: () => console.info("Users fetched!"),
  catch: () => console.log("Failed fetched!"),
  rateLimit: 60000,
  rateOnlySuccess: true,
  rateLimitHadler: remainingTime =>
    console.warn(`Please wait ${Math.round(remainingTime / 1000)} seconds`),
  options: {
    responseAs: "json",
    mode: "cors"
  }
});

function requestPack() {
  return Promise.all([
    $posts.get("1"),
    $posts.post({ body: "Losos" }),
    $posts.patch("1", { body: "Losos" }),
    $updateUser()
  ]);
}

btn.addEventListener("click", async () => {
  let result = await requestPack();
  console.log(result);
  result = await requestPack();
  console.log(result);
});
