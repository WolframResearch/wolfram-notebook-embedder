---
id: Development
title: Development
---

Please read the [Contributing Agreement](./ContributingAgreement.md) first. By contributing to this repository, you agree to the licensing terms herein.

To install all required dependencies for development of this library, run:

    yarn install

## Examples

To manually test embedded notebooks, run

    yarn run-examples
    
and visit the resulting localhost URL (usually http://localhost:5000). On that page, you can enter the path of a notebook on your localhost cloud to embed it.

## Documentation

The library's website is built using [Docusaurus](https://docusaurus.io). In the `website` directory, run

    yarn install
    
to install all necessary dependencies, and then either

    yarn start
    
to start a live-updating build process or

    yarn build
    
to generate static HTML in `website/build`.

## Releasing a new version

To release a new version, log in to npm using

    yarn login
    
as an owner of the [wolfram-notebook-embedder](https://www.npmjs.com/package/wolfram-notebook-embedder) package.

Check out the `master` branch and make sure there are no uncommitted changes:

    git checkout master
    
Then run

    yarn publish
    
which asks for the new package version, updates `package.json` accordingly, runs a build, creates a Git tag, and publishes the package.

If publishing fails due to missing authentication even though you have run `yarn login`, you might have to delete `~/.npmrc` and log in again (see [this Yarn issue](https://github.com/yarnpkg/yarn/issues/4709)).

If [two-factor authentication](https://docs.npmjs.com/configuring-two-factor-authentication) is enabled for your account, you will be asked for a one-time password during the publishing process.
