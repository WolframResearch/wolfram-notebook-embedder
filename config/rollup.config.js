import babel from 'rollup-plugin-babel';

export default {
    input: 'src/main.js',
    output: {
        format: 'iife',
        file: 'dist/notebook.dev.js',
        name: 'WolframEmbeddedNotebook',
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
        })
    ]
};
