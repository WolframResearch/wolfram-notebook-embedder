# Development

To install all required dependencies for development of this library, run:

    yarn install

## Examples

To manually test embedded notebooks, run

    yarn run-examples
    
and visit the resulting localhost URL (usually [http://localhost:5000](http://localhost:5000)). On that page, you can enter the path of a notebook on your localhost cloud to embed it.

## Releasing a new version

To release a new version, log in to npm using

    yarn login
    
as an owner of the [wolfram-notebook-embedder](https://www.npmjs.com/package/wolfram-notebook-embedder) package.
    
Then run

    yarn release
    
which uses [np](https://github.com/sindresorhus/np) to guide through the publishing process. It asks for the new package version, performs a clean build, creates a Git tag, and publishes the package.

If publishing fails due to missing authentication even though you have run `yarn login`, you might have to delete `~/.npmrc` and log in again (see [this yarn issue](https://github.com/yarnpkg/yarn/issues/4709)).

If you want to run the publishing process again (e.g. because authentication failed in the first run) without bumping the version, run

    yarn publish
    
directly, which will by-pass `np` used by `yarn release`.
