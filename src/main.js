let libraryLoading = {};
let counter = 0;

function getBrowserVersion(ua, browser) {
    const pos = ua.indexOf(browser);
    if (pos >= 0) {
        const rest = ua.substr(pos + browser.length + 1);
        const version = Number.parseInt(rest, 10);
        if (version) {
            return version;
        }
    }
    return 0;
}

function isModernBrowser() {
    const ua = navigator.userAgent;
    return getBrowserVersion(ua, 'Chrome') >= 59 || getBrowserVersion(ua, 'Firefox') >= 52 || getBrowserVersion(ua, 'Edge') >= 14 || getBrowserVersion('Safari') >= 11;
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

function getLibraryURL(cloudObjectURL) {
    const objectsPos = cloudObjectURL.indexOf('/objects');
    if (objectsPos < 0) {
        throw new Error('InvalidCloudObjectURL');
    }
    const suffix = isModernBrowser() ? '.modern.js' : '.js';
    return cloudObjectURL.substring(0, objectsPos) + '/dist/public/notebookEmbedding' + suffix;
}

export function create(url, node, options) {
    return Promise.resolve()
        .then(() => {
            return loadLibrary(getLibraryURL(url));
        })
        .then(lib => {
            return lib.create(url, node, options);
        });
}
