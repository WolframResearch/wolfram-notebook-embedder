---
id: LibraryInterface
title: Library Interface
---

This library exposes a single function `embed` that renders a notebook into a given DOM node and returns an interface for further interaction with the notebook:

```js
WolframNotebookEmbedder.embed(notebookURL, domNode, attributes)
```

* `notebookURL`: a string with a cloud object URL of the notebook to embed, e.g. `'https://www.wolframcloud.com/obj/4beadfbb-84dd-4b26-87b6-bcd30b9abd65'` or `'https://www.wolframcloud.com/obj/myusername/myfolder/mynotebook.nb'`
* `domNode`: a DOM node in which to render the notebook, e.g. obtained by `document.getElementById('myContainer')`
* `attributes `: a JS object with attributes

The following attributes can be given:

* `width`: width of the notebook in pixels; a value of `null` (the default) makes the notebook adapt to the width of the container node
* `maxHeight`: maximum height of the notebook in pixels; a value of `Infinity` (the default) allows the notebook to grow infinitely; a value of `null` makes the notebook adapt to the height of the container node
* `allowInteract`: whether to enable interactivity in the notebook, which might use the server-side Wolfram Engine for computations; even if this is set to `true` (the default), the `Permissions` of the cloud notebook must also include `All -> {"React", "Interact"}` for interactions to actually work
* `showRenderProgress`: whether to show the render progress indicator at the top of the notebook during the initial loading phase (see [Notebook Loading Phases](./NotebookLoadingPhases.md) for more information); the default is `true`

If the notebook exceeds the given width or height, scrollbars are introduced in that dimension. The default dimensions (`width: null`, `maxHeight: Infinity`) let the notebook adapt to the container node's width (line-wrapping as necessary) and make the container node grow vertically as necessary, so there won't be a vertical scrollbar, and there will only be a horizontal scrollbar if the notebook's contents are inherently wider than the available width (e.g. a graphic with a fixed size). In the case of `maxHeight: null`, the notebook's background will fill out the whole container node even if the notebook content is smaller.

The embedded notebook needs to be public (i.e. with [Permissions](https://reference.wolfram.com/language/ref/Permissions.html) of at least `All->"Read"`). For interactivity to work, the `"Interact"` permission is needed.

Notebooks on [Wolfram Enterprise Private Cloud (EPC)](https://www.wolfram.com/enterprise-private-cloud/) can be embedded as well, as long as they are public. Just use the cloud object URL pointing to your EPC as the `notebookURL`.

The function `embed` returns a `Promise` resolving to an object with various methods to control the notebook, e.g.:

* `setAttributes(options)`: changes embedding attributes
* `detach()`: call this function when the embedded notebook is no longer needed, e.g. because the node it is embedded in disappears
* `addEventListener(eventName, callback)`: registers an event listener
* `removeEventListener(eventName, callback)`: unregisters an event listener
* many other notebook-related functions, e.g. `getDimensions()`, `getCells()`, `evaluateExpression(expr)`

See the [notebook API documentation](./NotebookAPI.md) for more details about these methods.

If something goes wrong while loading the notebook (e.g. because there is no notebook at the given `notebookURL`), the returned promise is rejected.
