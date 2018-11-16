# Library Interface

This library exposes a single function `mount` that renders a notebook into a given DOM node and returns an interface for further interaction with the notebook:

```js
WolframNotebookEmbedding.mount(notebookURL, domNode, attributes)
```

* `notebookURL`: string with a cloud object URL of the notebook to embed, e.g. `'https://www.wolframcloud.com/objects/4beadfbb-84dd-4b26-87b6-bcd30b9abd65'` or `'https://www.wolframcloud.com/objects/myusername/myfolder/mynotebook.nb'`
* `domNode`: a DOM node to render the notebook in, e.g. obtained by `document.getElementById('myContainer')`
* `attributes `: a JS object with attributes

The following attributes can be given:

* `maxWidth`, `maxHeight`: maximum width and height of the notebook, in pixels; if the notebook exceeds these dimensions, scrollbars will be used; a value of `Infinity` allows the notebook to grow infinitely in that dimension; a value of `null` (the default) makes the notebook adapt to the size of the container node
* `allowInteract`: whether to enable interactivity in the notebook, which might use the server-side Wolfram Engine for computations; even if this is set to `true`, the `Permissions` of the cloud notebook must also include `All -> {"React", "Interact"}` for interactions to actually work

The embedded notebook needs to be public (i.e. with [Permissions](https://reference.wolfram.com/language/ref/Permissions.html) of at least `All->"Read"`). For interactivity to work, the `"Interact"` permission is needed.

Notebooks on an [Enterprise Private Cloud](https://www.wolfram.com/enterprise-private-cloud/) can be embedded as well, as long as they are public. Just use the cloud object URL pointing to your EPC as the `notebookURL`.

The function `mount` returns a `Promise` resolving to an object with various methods to control the notebook, e.g.:

* `setAttributes(options)`: changes embedding attributes
* `unmount()`: call this function when the embedded notebook is no longer needed, e.g. because the node it is mounted in disappears
* `addEventListener(eventName, callback)`: registers an event listener
* `removeEventListener(eventName, callback)`: unregisters an event listener
* many other notebook-related functions, e.g. `getDimensions()`, `getCells()`, `evaluateExpression(expr)`

See the [Notebook API documentation](./NotebookAPI.md) for more details about these methods.

If something goes wrong while loading the notebook (e.g. because there is no notebook at the given `notebookURL`), the returned promise is rejected.
