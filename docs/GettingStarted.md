# Getting Started

1. Create a notebook in the [Wolfram Cloud](https://www.wolframcloud.com/) and make it public.
    * In the Cloud UI, use the "New Notebook" button and then use the "Share" dialog to make it public.
    * From the Wolfram Language, you could deploy notebook content like so:

            CloudDeploy[Manipulate[Plot[Sin[a*x], {x, 0, 2Pi}], {a, 1, 3}], Permissions->{All->{"Read", "Interact"}}]
2. Install this library in your JS project using

        npm install wolfram-notebook-embedding
        
    so you can import it in JS as
    
        import WolframNotebookEmbedding from 'wolfram-notebook-embedding';
        
    or import it as a `<script>` tag from a CDN:
    
        <script crossorigin src="https://unpkg.com/wolfram-notebook-embedding@0.1/umd/wolfram-notebook-embedding.min.js"></script>
3. In your HTML, create a container where you want the notebook to be rendered (let's say `<div id="notebookContainer"></div>`) and add the following JS code:

        var embedding = WolframNotebookEmbedding.mount('url', document.getElementById('notebookContainer'));
    
    where `url` is the URL of your cloud object from step 1. More details about `mount` are described in the [library interface documentation](./LibraryInterface.md).
4. If you want to control the notebook from your JS code, wait for the `mount` result (a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)) to resolve and then use various [Notebook API methods](./NotebookAPI.md):

        embedding.then(function (nb) {
            // This will reset the DynamicModule variable x$$
            // in the first cell of the notebook.
            return nb.getCells().then(function (cells) {
                nb.setDynamicModuleVariable({
                    cellId: cells[0].id,
                    name: 'x$$',
                    value: 0
                });
            });
        })
5. If you run into any issues, take a look at the [Troubleshooting guide](./Troubleshooting.md). If you think you found a bug, please report it.
