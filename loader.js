function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = false; // keep order
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${url}`));
    document.head.appendChild(script);
  });
}

function loadStyle(url) {
  const link = document.createElement('link');
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

async function initLoader() {
  try {
    // External libraries
    await loadScript("https://apis.google.com/js/api.js");
    await loadScript("https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js");

    // ✅ Load CONFIG first
    await loadScript("https://alsys123.github.io/APL-ES/configBridge.js");

    // Then your exam scripts
    await loadScript("https://alsys123.github.io/APL-ES/mainline.js?v=3");
   
    // Styles
    loadStyle("https://alsys123.github.io/APL-ES/style.css?v=2");

    console.log("All scripts and styles loaded!");
  } catch (err) {
    console.error("Loader error:", err);
  }
}

initLoader();
