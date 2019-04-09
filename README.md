# browser-cjs

> A minimal *CommonJS* module loader for the browser environment.

As a client-side *CommonJS* module loader, **browser-cjs** aims to implement a Node.js-like module loader in the browser environment. More specifically, it defines and adds in global scope of the browser a utility function called `require`, whose role is to **synchronously** load JS modules defined according to the *CommonJS* paradigm.

## Installation

To give **browser-cjs** a try download it or install it with `npm`:

```sh
npm install --save browser-cjs
```

## Usage

### Loading *CommonJS module* files

To use **browser-cjs** as a client-side script-loader (module-loader), first load it in your page using an HTML `script` tag, as in the following example:

```html
<script src="/node_modules/browser-cjs/require.js"></script>
```

**Note:**

In a case when the runtime environment already supports the `require` utility function (such as the `ElectronJS` environment), **browser-cjs** will not override or replace the existing `require` function; instead, it will reuse it as-is.

To load modules with **browser-cjs** call the globally available `require` function, with the name of the file passed as argument (as it's done in Node.js). For instance, to load a module called `moduleName.js`:

```html
<script>
  const moduleName = require("/path/to/moduleName.js");
  // ...
  // The rest of the code goes here...
</script>
```

**Important:**

**It is necessary to specify the extension of the file (`.es6`, `.js`, etc.), because without the extension, **browser-cjs** will assume that `moduleName` is a directory and it will try to load the `/path/to/nodeModule/<package.main>` file, where `<package.main>` is the file `main` specified in the `package.json` (e.g.: `main: "./index.js"`).** (Please see *Limitations*)

### Loading non-*CommonJS module* files

In addition to *CommonJS modules*, **browser-cjs** supports loading plain JSON files too. However, it is important to remember that loading content with **browser-cjs** is performed synchronously, which is most cases this is not recommended for this type of files (well, unless it is some special case, such as loading configuration files).

Thus, to let **browser-cjs** know that the content it has to load is not a module, but a JSON file, the file name must end with the `.json` extension. Here are some examples of loading JSON files with **browser-cjs**'s `require` utility:

```js
const config = require("/path/to/file/config.json");
const package = require("/package.json");
```

### Options

To allow the user to modify its default configuration, **browser-cjs** supports a set of options (parameters), which includes:

* `scripts` - a comma separated list of prerequisite non-CommonJS Javascript files,
* `styles` - a comma separated list of stylesheets,
* `base_dir` - the base URL (URI) to automatically prepend to all relative links. The default option is `base_dir="/"`,
* `main` - the initial, entry point)  module to load and run first . The default is `null`, in which case no module will be automatically loaded and run,

which can be passed as data attributes (using the `data-` prefix) to the `script` tag that loads the library, allow the user to modify the default configuration of **browser-cjs**. For instance, the following:

```html
<script
  src="/node_modules/browser-cjs/require.js"
  data-base_dir="./dist"
  data-styles="./css/style.css"
  data-scripts="https://unpkg.com/react@16/umd/react.production.min.js, https://unpkg.com/react-dom@16/umd/react-dom.production.min.js, https://unpkg.com/prop-types@15.6/prop-types.min.js"
  data-main="./dist/index.js">
</script>
```

is an example of a `script` tag which, in addition to loading the `require.js` file, specifies the base URL for all relative links, specifies a stylesheet and some pre-requisite (probably non-CommonJS compatible) scripts to load, and indicates the file to execute first as the main entry point of the application.

### Example

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Browser-CJS Example</title>

    <!-- load the <b>browser-cjs</b> library -->
    <script src="../../../../require.js" data-scripts="https://unpkg.com/jquery@3.3.1/dist/jquery.js">
    </script>

    <!-- the main script -->
    <script>
      window.addEventListener("load", () => {
        const package = require("./package.json");
        $("#root").html(`<div>
          <h2>${package.name}</h2>
          <p>${package.description}</p>
          <div>Version: <span>${package.version}</span></div>
          <hr />
          <div>jQuery version: <span>${$.fn.jquery}</span></div>
        </div>`);
      });
    </script>
  </head>

  <body>
    <div id="root"></div>
  </body>
</html>
```

## Limitations

Since this library is not intended for the `Node js` environment; it will resolve the path to a given module relative to the current directory, the root directory or the `data-base_dir` script attribute, if provided.

For this reason, modules located inside `npm` packages must be requested by their full path relative to the `node_modules` directory, (e.g. `require("/node_modules/atob");`, `require("/node_modules/use")` or `require("/node_modules/wrappy")`), acknowledging that there is no guarantee that all `Node.js` modules will be able to run, or run correctly, in the browser environment.

## Version

1.0.0
