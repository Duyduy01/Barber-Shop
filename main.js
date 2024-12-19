import routes, { layoutDefault } from "./router.js";
import { SMOOTH } from "./constant.js";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js", {
      scope: "/",
    });
  });
}

// slider
export function handleSlide(event, callback) {
  const type = event.currentTarget.getAttribute("data-type");
  const slider = document.getElementById(type);

  if (!type || !slider) return;
  const action =
    event.currentTarget.getAttribute("data-action") === "prev"
      ? "prev"
      : "next";
  const behavior = SMOOTH;

  callback(slider, action, behavior);
}

// mounted app
function addStyleAndScripts(doc, elementId) {
  // Apply styles
  const styleTags = doc.querySelectorAll("style");
  styleTags.forEach((style) => {
    const newStyle = document.createElement("style");
    newStyle.innerHTML = style.innerHTML;
    newStyle.setAttribute("data-owner", elementId);
    document.head.appendChild(newStyle);
  });

  // Execute scripts
  const scriptTags = doc.querySelectorAll("script");
  scriptTags.forEach((script) => {
    const newScript = document.createElement("script");
    newScript.type = "module";
    newScript.innerHTML = script.innerHTML;
    newScript.setAttribute("data-owner", elementId);
    document.body.appendChild(newScript);
    script.remove();
  });
}

function removeStylesAndScripts(elementId) {
  document
    .querySelectorAll(`[data-owner="${elementId}"]`)
    .forEach((el) => el.remove());
}

function handleUnmount(elementId) {
  if (typeof window.beforeUnmount === "function") {
    window.beforeUnmount();
  }
  removeStylesAndScripts(elementId);
  window.beforeUnmount = () => {};
}

async function loadContent(url, elementId) {
  try {
    if (elementId === "app") handleUnmount(elementId);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, "text/html");

    window.beforeUnmount = () => {};
    addStyleAndScripts(doc, elementId);
    // Set the content
    document.getElementById(elementId).innerHTML = doc.body.innerHTML;
  } catch (error) {
    await pageNotFound();
  }
}

async function pageNotFound() {
  window.location.hash = "#/404";
  const route = routes.find((r) => `#${r.path}` === window.location.hash);
  const notFoundUrl = await route.component();
  await loadContent(notFoundUrl, "app");
}
// routing
async function handleRouting() {
  window.scrollTo(0, 0);
  const hash = window.location.hash || "#/";
  const route = routes.find((r) => `#${r.path}` === hash);
  if (route && typeof route.component === "function") {
    const contentUrl = await route.component();
    loadContent(contentUrl, "app");
  } else {
    await pageNotFound();
  }
  return;
}

function attachLinkHandlers() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");

    if (link) {
      const href = link.getAttribute("href");
      if (/^(http|https):\/\//.test(href) || href.startsWith("#")) {
        return;
      }
      event.preventDefault();
      window.location.hash = href;
    }
  });
}

(function initializeApp() {
  loadContent(layoutDefault.Header, "header");
  loadContent(layoutDefault.Footer, "footer");
  handleRouting();
  window.onpopstate = handleRouting;

  attachLinkHandlers();
})();
