# Server-side rendering

In some cases, you might want to include (static) HTML for a notebook on your page so it can be rendered even before the necessary JavaScript code is loaded and executed. This reduces the time until the user sees the notebook, and it also helps search engines to index your notebook content. Once your JS code executes, you can [mount](./LibraryInterface.md) the notebook into the same container node, and it will transition seamlessly from the static view to "live" (interactive) rendering. The same happens on [wolframcloud.com](https://www.wolframcloud.com) as well.

Static HTML is generated ("pre-rendered") for each cloud notebook whenever it is created or changed. You can access it through an HTTP API, by making a `GET` request to

    https://www.wolframcloud.com/notebooks/html?path={path}
    
where `{path}` is the notebook's cloud object path, which might be a UUID (e.g. `4beadfbb-84dd-4b26-87b6-bcd30b9abd65` for a cloud object at `https://www.wolframcloud.com/objects/4beadfbb-84dd-4b26-87b6-bcd30b9abd65`) or a user base URL + folder/file name (e.g. `myname/foo/bar.nb` for a cloud object at `https://www.wolframcloud.com/objects/myname/foo/bar.nb`).

This API returns a piece of static HTML that can be included right on your page by your server-side code.

## Waiting for HTML to be available

Sometimes, there might be no HTML for a notebook available yet, e.g. when it has just been edited and the cloud server didn't get a chance to pre-render it yet. In that case, the API will return an empty response. However, you can tell the API to wait up to a certain time and return static HTML once it becomes available. That's what the query parameter `maxwaitmillis` is for. E.g.

    https://www.wolframcloud.com/notebooks/html?path=4beadfbb-84dd-4b26-87b6-bcd30b9abd65&maxwaitmillis=500
    
would wait up to 500 milliseconds in case there is no HTML available yet and return once it becomes available. If the cloud server hasn't finished generating HTML after half a second, the API will return an empty response.

The maximum accepted value for `maxwaitmillis` is 20,000 (20 seconds). Typically, we recommend using rather low values (not longer than 1 second), since this would delay the initial response from your server (while it's waiting for the cloud server to return HTML) and thus the loading of the whole page.

## Specifying a notebook width

Parts of the static HTML might depend on the page width, e.g. to determine where to line-wrap code cells. Since the page width is not usually known on the server, it can only assume a certain notebook width and return HTML for that, which will cause text to reflow on the client side (once the actual page width is known and "live" rendering kicks in). If you do know the notebook width in advance (e.g. because you're embedding the notebook at a fixed width), you can request HTML for that particular width using the `width` parameter to the API. E.g. 

    https://www.wolframcloud.com/notebooks/html?path=4beadfbb-84dd-4b26-87b6-bcd30b9abd65&width=700
    
would request HTML for a notebook width of 700 pixels. There's no guarantee that you get HTML for *exactly* that width, but the API will choose the best match out of the available pre-rendered HTML.

## Example

Take a look at the [server-side rendering example](../examples/ssr.html) for how this API can be used in combination with client-side rendering. It is a bit contrived, though, since it fetches the notebook HTML from the client side, whereas this would typically happen on the server side.
