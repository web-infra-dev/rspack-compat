import { themeClass, exampleStyle } from "./index.css.ts";

function render() {
  const container = document.getElementById("root");
  container.innerHTML = ` <section class="${themeClass}">
  <h1 class="${exampleStyle}">Hello world!</h1>
</section>`;
}

render();
