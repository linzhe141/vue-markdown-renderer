import "./polyfill";
import { createApp, h, render } from "vue";
import App from "./App.vue";
import ErrorBoundary from "./ErrorBoundary.vue";
const app = createApp(App);
app.config.errorHandler = (e) => {
  const errorDom = document.getElementById("error")!;
  render(h(ErrorBoundary, { error: e }), errorDom);
};
app.mount("#app");
