import PromisePolyfill from 'promise-polyfill';

const globalNS = (function() {
    if (typeof self !== 'undefined') {
        return self;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
    throw new Error('Unable to locate global object');
})();

const Promise = globalNS.Promise || PromisePolyfill;

const installedScripts = {};
const libraryLoading = {};
let counter = 0;
let isStyleInsertionPatched = false;
const insertedStyles = [];
const styleInsertionCallbacks = [];

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
                callbackName = '_wolframNotebookEmbedderCallback' + (++counter);
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

function isNotebookStyleElement(element, domains) {
    const name = element.tagName.toLowerCase();
    if (name === 'link' && (element.rel === 'stylesheet' || element.type === 'text/css')) {
        return domains.some(domain => element.href.startsWith(domain));
    } else if (name === 'style') {
        if (element.dataset.isWolframNotebookStyle) {
            return true;
        }
        if (element.id === 'erd_scroll_detection_scrollbar_style') {
            return true;
        }
    }
    return false;
}

function patchShadowStyleInsertion(container, domains) {
    function callback(element) {
        container.appendChild(element);
    }

    if (!isStyleInsertionPatched) {
        const head = document.getElementsByTagName('head')[0];
        if (head) {
            const originalAppendChild = head.appendChild;
            head.appendChild = function (child) {
                if (isNotebookStyleElement(child, domains)) {
                    insertedStyles.push(child);
                    styleInsertionCallbacks.forEach(callback => {
                        callback(child);
                    });
                } else {
                    originalAppendChild.call(this, child);
                }
            };
        }
        isStyleInsertionPatched = true;
    }

    insertedStyles.forEach(existingStyle => {
        callback(existingStyle);
    });
    styleInsertionCallbacks.push(callback);
    const index = styleInsertionCallbacks.length - 1;
    return () => {
        styleInsertionCallbacks.splice(index, 1);
    };
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
                    otherScripts: (data.otherScripts || []).map(script => domain + script),
                    stylesheetDomains: [domain, ...data.stylesheetDomains]
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

function defaultValue(value, fallback) {
    if (value === undefined) {
        return fallback;
    } else {
        return value;
    }
}

export function embed(url, node, options) {
    let theNotebookID;
    const theOptions = options || {};
    const {useShadowDOM = true} = theOptions;
    const useShadow = useShadowDOM && node.attachShadow;
    let container;
    let shadowRoot;
    return Promise.resolve()
        .then(() => {
            if (useShadow) {
                container = document.createElement('div');
                container.style.width = '100%';
                container.style.height = '100%';
                shadowRoot = node.attachShadow({mode: 'open'});
                shadowRoot.appendChild(container);
            } else {
                container = node;
            }
            return getNotebookData(url);
        })
        .then(({notebookID, mainScript, otherScripts, stylesheetDomains}) => {
            if (useShadow) {
                patchShadowStyleInsertion(shadowRoot, stylesheetDomains);
                // TODO: Call the returned cleanup callback when notebook is unmounted.
            }
            theNotebookID = notebookID;
            for (let i = 0; i < otherScripts.length; ++i) {
                installScript(otherScripts[i]);
            }
            return loadLibrary(mainScript);
        })
        .then(lib => {
            return lib.embed(theNotebookID, container, {
                width: defaultValue(theOptions.width, null),
                maxHeight: defaultValue(theOptions.maxHeight, Infinity),
                allowInteract: defaultValue(theOptions.allowInteract, true),
                showRenderProgress: defaultValue(theOptions.showRenderProgress, true)
            });
        })
        .then(embedding => {
            return {
                ...embedding,
                setAttributes: (attrs) => {
                    const {useShadowDOM, ...rest} = attrs;
                    embedding.setAttributes(rest);
                }
            };
        });
}
