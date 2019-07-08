/**
 * A minimal CommonJS-compatible (nodejs-like) module loader for the browser environment.
 */
window.require = typeof require === "function" ? (function (require, document) {
  const tmp = document.querySelector("script[data-main]");
  if (tmp) {
    require(tmp.dataset.main);
  }
  return require;
}(require, document)) : (function (document) {
  /**
   * load prerequisites (non-CJS scripts, stylesheets, etc.)
   *
   * @returns {String} The base directory
   */
  function loadPrerequisites() {
    const head = document.head;
    const tmpScripts = document.querySelector("script[data-scripts]");
    const tmpStyles = document.querySelector("script[data-styles]");
    const styles = tmpStyles ? tmpStyles.dataset.styles : "";
    const scripts = tmpScripts ? tmpScripts.dataset.scripts : "";
    const tmpBaseDir = document.querySelector("script[data-base_dir]");
    let baseDir = tmpBaseDir ? tmpBaseDir.dataset.base_dir : "/";
    let tag;

    if (baseDir && typeof baseDir === "string") {
      baseDir = new URL(baseDir.trim(), location.origin).href;
      tag = document.createElement("base");
      tag.setAttribute("href", baseDir);
      head.append(tag);
    }

    if (typeof styles === "string") {
      styles.trim().replace(/,[ ]*/gim, ",").split(",").forEach((url) => {
        tag = document.createElement("link");
        tag.setAttribute("rel", "stylesheet");
        tag.setAttribute("type", "text/css");
        tag.setAttribute("href", url.trim());
        head.append(tag);
      });
    }
    if (typeof scripts === "string") {
      scripts.trim().replace(/,[ ]*/gim, ",").split(",").forEach((url) => {
        tag = document.createElement("script");
        tag.setAttribute("type", "text/javascript");
        tag.setAttribute("src", url.trim());
        head.append(tag);
      });
    }
    return baseDir;
  }

  /**
   * Performs a synchronous XHR
   *
   * @param {String} url The request URL
   * @returns {XMLHttpRequest} The XHR instance
   */
  function getSynchXHR(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();
    return xhr;
  }

  /**
   * If the file path given as argument does not have an extension
   * (such as `.js`, `.es6`, `.json`, etc.), the assumption is that
   * it is a package, and it tries to determine the file name designated
   * as **main** in the `package.json` file, and attach it to the 
   * given file path.
   *
   * @param {String} filePath
   * @returns {String} The complete file path, including the main file name
   */
  function getFileName(filePath) {
    filePath = typeof filePath === "string" ? filePath : "";
    if (filePath.indexOf(".") < 0) {
      const xhr = getSynchXHR(`${filePath}/package.json`);
      if (xhr.status === 200) {
        const pack = JSON.parse(xhr.responseText);
        filePath = filePath + "/" + pack.main;
      }
    }
    return filePath;
  }

  return (function () {
    const modules = {};
    const baseDir = loadPrerequisites();
    const tmpMain = document.querySelector("script[data-main]");
    const mainStr = tmpMain ? tmpMain.dataset.main : null;

    /**
     * Loads CommonJS type of JS modules in the browser.
     *
     * @param {String} file The name of the file containing the Common JS module.
     * @param {String} resPath  The path, if not the default one, to the Common JS module.
     * @returns
     */
    function require(dirname, file) {
      file = typeof file === "string" ? file.trim() : "";
      const uri = new URL(file, dirname);

      uri.pathname = getFileName(uri.pathname);
      dirname = uri.href.substr(0, uri.href.lastIndexOf("/") + 1);
      let filename = uri.pathname.substr(uri.pathname.lastIndexOf("/") + 1);

      if (modules.hasOwnProperty(uri.href)) {
        return modules[uri.href];
      } else {
        const xhr = getSynchXHR(uri.href);

        if (xhr.status === 200) {
          const module = {};

          if (/(.json)$/gi.test(filename)) {
            module.exports = JSON.parse(xhr.responseText);
          } else {
            module.exports = {};
            new Function("exports", "require", "module", "__filename", "__dirname", `
              ${xhr.responseText}
              //# sourceURL=${uri.href}
            `).call(this, module.exports, require.bind(this, dirname), module, filename, dirname);
            modules[uri.href] = module.exports;
          }
          return module.exports;
        }
      }
      return;
    }

    Object.defineProperty(require, "modules", {
      set: Function.prototype,
      /**
       * The list af all currently loaded JS modules.
       */
      get: function () {
        return modules;
      }
    });

    const req = require.bind(this, baseDir);
    // Load the main (entry point) file
    if (mainStr) {
      window.addEventListener("load", req.bind(this, new URL(mainStr, baseDir).href));
    }
    return req;
  }());
}(document));
