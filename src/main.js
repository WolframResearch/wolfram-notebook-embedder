const installedScripts = {};
const libraryLoading = {};
let counter = 0;

function installScript(url) {
    if (!installedScripts[url]) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        const head = document.getElementsByTagName('head')[0];
        head.appendChild(script);
        installedScripts[url] = true;
    }
}

function loadLibrary(libraryURL) {
    if (!libraryLoading[libraryURL]) {
        libraryLoading[libraryURL] = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.onerror = reject;
            let callbackName;
            do {
                callbackName = '_wolframNotebookEmbeddingCallback' + (++counter);
            } while (window[callbackName]);
            window[callbackName] = (lib) => {
                delete window[callbackName];
                resolve(lib);
            };
            script.src = libraryURL + '?callback=' + callbackName;
            const head = document.getElementsByTagName('head')[0];
            head.appendChild(script);
        });
    }
    return libraryLoading[libraryURL];
}

/**
 * Splits a string into two parts at the first occurrence of any of the given separators.
 * @param s String to split.
 * @param separators Array of separators. Whichever separator occurs first in the string
 * is where the split happens.
 * @returns The part before the separator and the part after it.
 * If no separator occurs in the string, `[null, null]` is returned.
 */
function split(s, separators) {
    let before = null;
    let after = null;
    for (let i = 0; i < separators.length; ++i) {
        const sep = separators[i];
        const index = s.indexOf(sep);
        if (index >= 0 && (before === null || index < before.length)) {
            before = s.substring(0, index);
            after = s.substring(index + sep.length);
        }
    }
    return [before, after];
}

function getNotebookData(url) {
    const [domain, path] = split(url, ['/obj/', '/objects/']);
    if (!domain || !path) {
        throw new Error('InvalidCloudObjectURL');
    }
    const embeddingAPI = domain + '/notebooks/embedding?path=' + path;
    return new Promise((resolve, reject) => {
        // Use XMLHttpRequest instead of fetch to be compatible with older browsers.
        const req = new XMLHttpRequest();
        req.addEventListener('load', () => {
            if (req.status === 200) {
                const text = req.responseText;
                const data = JSON.parse(text);
                resolve({
                    notebookID: data.notebookID,
                    mainScript: domain + data.mainScript,
                    otherScripts: (data.otherScripts || []).map(script => domain + script)
                });
            } else {
                reject(new Error('ResolveError'));
            }
        });
        req.addEventListener('error', () => {
            reject(new Error('RequestError'));
        });
        req.addEventListener('abort', () => {
            reject(new Error('RequestAborted'));
        });
        req.open('GET', embeddingAPI);
        req.send();
    });
}

export function create(url, node, options) {
    let theNotebookID;
    return Promise.resolve()
        .then(() => {
            return getNotebookData(url);
        })
        .then(({notebookID, mainScript, otherScripts}) => {
            theNotebookID = notebookID;
            for (let i = 0; i < otherScripts.length; ++i) {
                installScript(otherScripts[i]);
            }
            return loadLibrary(mainScript);
        })
        .then(lib => {
            return lib.create(theNotebookID, node, options);
        });
}
