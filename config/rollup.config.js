import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

export default {
    input: 'src/main.js',
    output: {
        format: 'umd',
        file: 'dist/wolfram-notebook-embedder.js',
        name: 'WolframNotebookEmbedder',
        sourcemap: true,
        strict: true
    },
    plugins: [
        babel({
            sourceMap: true,
            exclude: 'node_modules/**',
            babelrc: false,
            comments: false,
            presets: [
                ['@babel/env', {
                    modules: false,
                    loose: true,
                    targets: {
                        browsers: ['last 2 versions', 'IE >= 11']
                    }
                }]
            ]
        }),
        resolve()
    ]
};
