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
    function callback(element, allowMove) {
        // When inserting the style element for the first time, use the original element,
        // to make sure that onload and onerror handlers are preserved.
        // For subsequent insertions (second embedded notebook and beyond), clone the element.
        const styleElement = allowMove && !element.didInsertWithoutCloning ? element : element.cloneNode(true);
        element.didInsertWithoutCloning = true;
        container.appendChild(styleElement);
    }

    function handleStyleElement(element, allowMove) {
        if (isNotebookStyleElement(element, domains)) {
            insertedStyles.push(element);
            styleInsertionCallbacks.forEach(cb => {
                cb(element, allowMove);
            });
            return true;
        }
        return false;
    }

    if (!isStyleInsertionPatched) {
        // There might be notebook-related <link> or <style> elements on the page already,
        // e.g. when static HTML is already included on the page.
        // These elements are not even necessarily in the document's <head>,
        // but the notebook JS code will still not insert them again,
        // so it's important we look for them anywhere in the document.
        const existingLinks = document.getElementsByTagName('link');
        for (let i = 0; i < existingLinks.length; ++i) {
            handleStyleElement(existingLinks[i], true);
        }
        const existingStyles = document.getElementsByTagName('style');
        for (let i = 0; i < existingStyles.length; ++i) {
            handleStyleElement(existingStyles[i], true);
        }
        const head = document.getElementsByTagName('head')[0];
        if (head) {
            const originalAppendChild = head.appendChild;
            head.appendChild = function (child) {
                if (!handleStyleElement(child, false)) {
                    originalAppendChild.call(this, child);
                }
            };
        }
        isStyleInsertionPatched = true;
    }

    insertedStyles.forEach(existingStyle => {
        callback(existingStyle, false);
    });
    styleInsertionCallbacks.push(callback);
    const index = styleInsertionCallbacks.length - 1;
    return () => {
        styleInsertionCallbacks.splice(index, 1);
    };
}

function getNotebookData(url) {
    const [domain, remainingPaths] = split(url, ['/obj/', '/objects/']);
    if (!domain || !remainingPaths) {
        throw new Error('InvalidCloudObjectURL');
    }
    // For now the query string is simply pruned.
    const path = remainingPaths.split('?', 1)[0];
    if (!path) {
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
    const {useShadowDOM = false} = theOptions;
    const useShadow = useShadowDOM && node.attachShadow;
    let container;
    let shadowRoot;

    // The list of nodes that have their dimensions updated
    // when the notebook container dimensions are supposed to change.
    // The CloudPlatform code will currently also update the node's dimensions,
    // but still include it here, just to be sure.
    const containerNodes = [node];

    const cleanupHandlers = [];

    function onContainerDimensionsChange({width, height}) {
        containerNodes.forEach(containerNode => {
            if (width != null) {
                containerNode.style.width = `${width}px`;
            }
            if (height != null) {
                containerNode.style.height = `${height}px`;
            }
        });
    }

    return Promise.resolve()
        .then(() => {
            if (useShadow) {
                const shadowHost = document.createElement('div');
                shadowHost.style.width = '100%';
                shadowHost.style.height = '100%';
                shadowRoot = shadowHost.attachShadow({mode: 'open'});
                container = document.createElement('div');
                container.style.width = '100%';
                container.style.height = '100%';
                node.appendChild(shadowHost);

                // Workaround to make React's event handling work,
                // as suggested in https://github.com/facebook/react/issues/9242#issuecomment-534096832
                // This makes the shadow root appear like a "normal document", so React can use it
                // for creating elements and registering event handlers.
                // Otherwise, React event handlers wouldn't fire since events don't bubble up from
                // the shadow DOM to the top document.
                Object.defineProperty(container, 'ownerDocument', { value: shadowRoot });
                shadowRoot.createElement = (...args) => document.createElement(...args);
                shadowRoot.createElementNS = (...args) => document.createElementNS(...args);
                shadowRoot.createTextNode = (...args) => document.createTextNode(...args);
                shadowRoot.createDocumentFragment = (...args) => document.createDocumentFragment(...args);

                // Needed by jQuery, particularly $(...).offset.
                shadowRoot.documentElement = container;
                shadowRoot.defaultView = window;

                containerNodes.push(shadowHost);
                containerNodes.push(container);

                shadowRoot.appendChild(container);
            } else {
                container = node;
            }
            return getNotebookData(url);
        })
        .then(({notebookID, mainScript, otherScripts, stylesheetDomains}) => {
            if (useShadow) {
                const cleanup = patchShadowStyleInsertion(shadowRoot, stylesheetDomains);
                cleanupHandlers.push(cleanup);
                // Move other children from the outer node into the container inside the shadow DOM.
                // This is important so that a potential HTML cache is picked up by the notebook.
                for (let i = 0; i < node.children.length - 1; ++i) {
                    container.appendChild(node.children[i]);
                }
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
                showRenderProgress: defaultValue(theOptions.showRenderProgress, true),
                onContainerDimensionsChange
            });
        })
        .then(embedding => {
            return {
                ...embedding,
                detach: () => {
                    embedding.detach();
                    cleanupHandlers.forEach(cleanup => {
                        cleanup();
                    });
                },
                setAttributes: (attrs) => {
                    const {width, maxHeight, allowInteract, showRenderProgress} = attrs;
                    embedding.setAttributes({width, maxHeight, allowInteract, showRenderProgress});
                }
            };
        });
}
