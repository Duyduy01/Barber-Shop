import routes, { layoutDefault } from "./router.js";

// slider
export function handleSlide(event, callback) {
  const type = event.currentTarget.getAttribute("data-type");
  const slider = document.getElementById(type);
  const action =
    event.currentTarget.getAttribute("data-action") === "prev"
      ? "prev"
      : "next";
  const behavior = "smooth";

  callback(slider, action, behavior);
}

// mounted app
function addStyleAndScripts(doc, elementId) {
  // Apply styles
  const styleTags = doc.querySelectorAll("style");
  styleTags.forEach((style) => {
    const newStyle = document.createElement("style");
    newStyle.innerHTML = style.innerHTML;
    newStyle.setAttribute("style", elementId);
    document.head.appendChild(newStyle);
  });

  // Execute scripts
  const scriptTags = doc.querySelectorAll("script");
  scriptTags.forEach((script) => {
    const newScript = document.createElement("script");
    newScript.type = "module";
    newScript.innerHTML = script.innerHTML;
    newScript.setAttribute("script", elementId);
    document.body.appendChild(newScript);
    script.remove();
  });
}

function removeStylesAndScripts(elementId) {
  document
    .querySelectorAll(
      `style[style="${elementId}"], script[script="${elementId}"]`
    )
    .forEach((el) => el.remove());
}

async function loadContent(url, elementId) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, "text/html");

    if (elementId === "app") removeStylesAndScripts(elementId); // remove style and script of page

    addStyleAndScripts(doc, elementId);
    // Set the content
    document.getElementById(elementId).innerHTML = doc.body.innerHTML;
  } catch (error) {
    console.error("Error loading content:", error);
  }
}

// routing
async function handleRouting() {
  window.scrollTo(0, 0);
  const hash = window.location.hash || "#/";
  const route = routes.find((r) => `#${r.path}` === hash);

  if (route && typeof route.component === "function") {
    const contentUrl = await route.component();
    loadContent(contentUrl, "app");
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
