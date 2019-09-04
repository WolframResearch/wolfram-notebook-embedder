const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

function docUrl(siteConfig, doc) {
    const {baseUrl, docsUrl} = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    // const langPart = `${language ? `${language}/` : ''}`;
    const langPart = '';
    return `${baseUrl}${docsPart}${langPart}${doc}`;
}

function pageUrl(siteConfig, doc) {
    const {baseUrl} = siteConfig;
    // const langPart = (language ? `${language}/` : '');
    const langPart = '';
    return baseUrl + langPart + doc;
}

class HomeSplash extends React.Component {
  render() {
    const {siteConfig} = this.props;

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    );

    const ProjectTitle = () => (
      <h2 className="projectTitle">
        {siteConfig.title}
        <small>{siteConfig.tagline}</small>
      </h2>
    );

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const PrimaryButton = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button primary" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
        <div className="inner">
          <ProjectTitle siteConfig={siteConfig} />
          <PromoSection>
            <PrimaryButton href={docUrl(siteConfig,'GettingStarted')}>Get Started</PrimaryButton>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

class Index extends React.Component {
  render() {
    const {config: siteConfig, language = ''} = this.props;
    const {baseUrl} = siteConfig;

    const Block = props => (
      <Container
        padding={[]}
        id={props.id}
        background={props.background}>
        <GridBlock
          align={props.align || 'center'}
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    );

    // const FeatureCallout = () => (
    //   <div
    //     className="productShowcaseSection paddingBottom"
    //     style={{textAlign: 'center'}}>
    //     <h2>Feature Callout</h2>
    //     <MarkdownBlock>
    //     </MarkdownBlock>
    //   </div>
    // );

    // const TryOut = () => (
    //   <Block id="try">
    //     {[
    //       {
    //         content:
    //           'To make your landing page more attractive, use illustrations! Check out ' +
    //           '[**unDraw**](https://undraw.co/) which provides you with customizable illustrations which are free to use. ' +
    //           'The illustrations you see on this page are from unDraw.',
    //         image: `${baseUrl}img/undraw_code_review.svg`,
    //         imageAlign: 'left',
    //         title: 'Wonderful SVG Illustrations',
    //       },
    //     ]}
    //   </Block>
    // );

    const Description = () => (
      <Block background="light" align="left" id="background">
        {[
          {
            content:
              'Wolfram Notebook Embedder takes a public notebook in the [Wolfram Cloud](https://wwww.wolframcloud.com) and renders it into a given DOM node. ' +
              'It automatically fetches all required dependencies, such as further scripts, styles and fonts. ' +
              'The library and any additional notebook resources only need to be fetched, even if you embed multiple notebooks on a single page.',
            image: `${baseUrl}img/background.svg`,
            imageAlign: 'right',
            title: 'How It Works'
          },
        ]}
      </Block>
    );

    const QuickStart = () => (
        <Block align="left">
            {[
                {
                    content: `
Import the library from a CDN using a \`<script>\` tag such as
\`\`\`html
<script crossorigin src="https://unpkg.com/wolfram-notebook-embedder@0.1/dist/wolfram-notebook-embedder.min.js"></script>
\`\`\`
or install it in your JavaScript project using
\`\`\`bash
npm install wolfram-notebook-embedder
\`\`\`
in order to import it:
\`\`\`js
import WolframNotebookEmbedder from 'wolfram-notebook-embedder';
\`\`\`
Then you can call \`WolframNotebookEmbedder.embed\` to embed a public cloud notebook into a given DOM node.
`,
                    title: 'Quick Start'
                }
            ]}
        </Block>
    );

    // const LearnHow = () => (
    //   <Block background="light">
    //     {[
    //       {
    //         content:
    //           'Each new Docusaurus project has **randomly-generated** theme colors.',
    //         image: `${baseUrl}img/undraw_youtube_tutorial.svg`,
    //         imageAlign: 'right',
    //         title: 'Randomly Generated Theme Colors',
    //       },
    //     ]}
    //   </Block>
    // );

    const Features = () => (
      <Block layout="fourColumn" align="left">
        {[
          {
            content: 'Embed [notebooks](http://www.wolfram.com/notebooks/) on your site more seamlessly than what would be possible with iframes. An embedded notebook\'s dimensions can grow as large as necessary, or you can constrain its width and height as you wish.',
            image: `${baseUrl}img/seamless-embedding.svg`,
            imageAlign: 'top',
            title: 'Seamless Embedding',
          },
          {
            content: 'Control the notebook through an extensive JavaScript API. You can, for instance, change the value of a [Manipulate](https://reference.wolfram.com/language/ref/Manipulate.html) variable, open and close cell groups or evaluate [Wolfram Language](https://www.wolfram.com/language/) expressions from your JavaScript code.',
            image: `${baseUrl}img/scriptable-control.svg`,
            imageAlign: 'top',
            title: 'Scriptable Control',
          },
        ]}
      </Block>
    );

    const ViewExamples = () => (
      <div className="mainLink">
        <a href={pageUrl(siteConfig, 'Examples')}>View Examples »</a>
      </div>
    );

    const FullDocumentation = () => (
      <div className="mainLink">
        <a href={docUrl(siteConfig,'LibraryInterface')}>Full Documentation »</a>
      </div>
    );

    // const Showcase = () => {
    //   if ((siteConfig.users || []).length === 0) {
    //     return null;
    //   }
    //
    //   const showcase = siteConfig.users
    //     .filter(user => user.pinned)
    //     .map(user => (
    //       <a href={user.infoLink} key={user.infoLink}>
    //         <img src={user.image} alt={user.caption} title={user.caption} />
    //       </a>
    //     ));
    //
    //   const pageUrl = page => baseUrl + (language ? `${language}/` : '') + page;
    //
    //   return (
    //     <div className="productShowcaseSection paddingBottom">
    //       <h2>Who Is Using This?</h2>
    //       <p>Notebooks are embedded on all these sites:</p>
    //       <div className="logos">{showcase}</div>
    //       <div className="more-users">
    //         <a className="button" href={pageUrl('users.html')}>
    //           More {siteConfig.title} Users
    //         </a>
    //       </div>
    //     </div>
    //   );
    // };

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <Features />
          <ViewExamples />
          {/*<FeatureCallout />*/}
          {/*<LearnHow />*/}
          {/*<TryOut />*/}
          <Description />
          <QuickStart />
          <FullDocumentation />
          {/*<Showcase />*/}
        </div>
      </div>
    );
  }
}

module.exports = Index;
