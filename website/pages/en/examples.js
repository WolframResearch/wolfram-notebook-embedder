const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const Container = CompLibrary.Container;

const EXAMPLES = [
    {
        title: 'Basic example',
        description: 'Embed a particular notebook.',
        html: `<div id="container"></div>`,
        js: `
WolframNotebookEmbedder.embed(
    'https://www.wolframcloud.com/obj/jpoeschko/Public/BasicExample.nb',
    document.getElementById('container')
);
        `
    },
    {
        title: 'Controlling a Manipulate',
        description: 'Render a notebook specified in an input field and control a Manipulate variable in its last cell.',
        html: `
<p>
    Enter the URL of a cloud object:
    <input id="path" style="width:300px" value="https://www.wolframcloud.com/obj/jpoeschko/Public/Example.nb" />
    <button onclick="embedNotebook()">Embed Notebook</button>
</p>
<p>
    If the notebook's last cell contains a <code>Manipulate</code> with a variable <code>x</code>, this will reset it to 0:
    <button onclick="resetX()">Reset <code>x</code></button>
</p>
<div id="container"></div>
`,
        js: `
let embedding = null;

function embedNotebook() {
    const url = document.getElementById('path').value;
    embedding = WolframNotebookEmbedder.embed(url, document.getElementById('container'), {allowInteract: true});
}

function resetX() {
    if (embedding) {
        embedding.then(nb => {
            nb.getCells().then(({cells}) => {
                if (cells) {
                    const lastCell = cells[cells.length - 1];
                    return nb.setDynamicModuleVariable({
                        cellId: lastCell.id,
                        name: 'x$$',
                        value: 0
                    });
                }
            })
        })
    }
}
`
    }
];

function Example(props) {
    // See
    // https://blog.codepen.io/documentation/prefill-embeds/
    // https://blog.codepen.io/2019/01/17/introducing-prefill-embeds/
    // for details about the CodePen Prefill Embed API.
    const prefill = {
        title: props.title,
        description: props.description,
        tags: ['wolfram', 'notebook', 'embedding', 'wolfram-notebook-embedder'],
        scripts: ["https://unpkg.com/wolfram-notebook-embedder@0.1/dist/wolfram-notebook-embedder.min.js"]
    };
    return (
        <React.Fragment>
            <h2>{props.title}</h2>
            <p>{props.description}</p>
            <div
                className="codepen"
                data-prefill={JSON.stringify(prefill)}
                data-height="400"
                data-editable="true"
                data-default-tab="js,result"
            >
                <pre data-lang="html">{props.html.trim()}</pre>
                <pre data-lang="js">{props.js.trim()}</pre>
            </div>
        </React.Fragment>
    );
}

function Help(props) {
    const {config: siteConfig, language = ''} = props;
    const {baseUrl, docsUrl} = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;
    return (
        <div className="docMainWrapper wrapper">
            <Container className="mainContainer documentContainer postContainer">
                <div className="post">
                    <header className="postHeader">
                        <h1>Examples</h1>
                    </header>
                    <p>These examples are live demos using the Wolfram Notebook Embedder library.
                        They import the library from a CDN behind the scenes, which exposes the global <code>WolframNotebookEmbedder</code> JavaScript variable.
                        In your own project, you will probably want to install the library using npm or Yarn and import it locally,
                        as described in the <a href={docUrl('GettingStarted')}>Getting Started documentation</a>.</p>
                    {EXAMPLES.map(data => <Example key={data.title} {...data} />)}
                    <script async src="https://static.codepen.io/assets/embed/ei.js"></script>
                </div>
            </Container>
        </div>
    );
}

module.exports = Help;
