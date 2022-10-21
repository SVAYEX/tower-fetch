import { Tower } from "./src/class";

export default {};

const app = document.querySelector("#app");
if (!app) throw new Error("App element invalid");
const btn = document.createElement("button");
btn.textContent = "Simple requests!";
app.appendChild(btn);

const $fetch = new Tower("https://jsonplaceholder.typicode.com");

//const $todos = $fetch.up("/todos");
const $posts = $fetch.up("/posts");

const userId = 1;

function requestPack() {
  return Promise.all([
    $posts.get("1"),
    $posts.post({ body: "Losos" }),
    $posts.patch("1", { body: "Losos" })
  ]);
}

btn.addEventListener("click", async () => {
  let result = await requestPack();
  console.log(result);
  $posts.edit({
    headers: {
      Authorization: "LOSOS"
    }
  });
  result = await requestPack();
  console.log(result);
});
