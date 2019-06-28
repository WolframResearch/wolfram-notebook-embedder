const React = require('react');

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    const docsUrl = this.props.config.docsUrl;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    // const langPart = `${language ? `${language}/` : ''}`;
    const langPart = '';
    return `${baseUrl}${docsPart}${langPart}${doc}`;
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    // const langPart = (language ? `${language}/` : '');
    const langPart = '';
    return baseUrl + langPart + doc;
  }

  render() {
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
                width="66"
                height="58"
              />
            )}
          </a>
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl('GettingStarted', this.props.language)}>
              Getting Started
            </a>
            <a href={this.docUrl('LibraryInterface', this.props.language)}>
              Library API
            </a>
            <a href={this.pageUrl('examples', this.props.language)}>
              Examples
            </a>
          </div>
          <div>
            <h5>Community</h5>
            <a href={this.pageUrl('users', this.props.language)}>
              User Showcase
            </a>
            <a
              href="https://community.wolfram.com/content?curTag=wolfram%20cloud"
              target="_blank"
              rel="noreferrer noopener">
              Wolfram Community
            </a>
          </div>
          <div>
            <h5>More</h5>
            {/*<a href={`${this.props.config.baseUrl}blog`}>Blog</a>*/}
            <a href="https://github.com/WolframResearch/wolfram-notebook-embedder">GitHub</a>
            <a
              className="github-button"
              href={this.props.config.repoUrl}
              data-icon="octicon-star"
              data-count-href="/WolframResearch/wolfram-notebook-embedder/stargazers"
              data-show-count="true"
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star this project on GitHub">
              Star
            </a>
          </div>
        </section>

        <section className="copyright">{this.props.config.copyright}</section>
      </footer>
    );
  }
}

module.exports = Footer;
