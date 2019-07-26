const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

class HomeSplash extends React.Component {
  render() {
    const {siteConfig, language = ''} = this.props;
    const {baseUrl, docsUrl} = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

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

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
        <div className="inner">
          <ProjectTitle siteConfig={siteConfig} />
          <PromoSection>
            <Button href={docUrl('GettingStarted')}>Get Started</Button>
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
        padding={['bottom', 'top']}
        id={props.id}
        background={props.background}>
        <GridBlock
          align="center"
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
      <Block background="light">
        {[
          {
            content:
              'Wolfram Notebook Embedder takes a public notebook in the [Wolfram Cloud](https://wwww.wolframcloud.com) and renders it into a given DOM node. ' +
              'It automatically fetches all required dependencies, such as further scripts, styles and fonts. ' +
              'The library and any additional notebook resources only need to be fetched, even if you embed multiple notebooks on a single page.',
            image: `${baseUrl}img/undraw_note_list.svg`,
            imageAlign: 'right',
            title: 'Background',
          },
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
      <Block layout="fourColumn">
        {[
          {
            content: 'Embed [notebooks](http://www.wolfram.com/notebooks/) on your site more seamlessly than what would be possible with iframes. An embedded notebook\'s dimensions can grow as large as necessary, or you can constrain its width and height as you wish.',
            image: `${baseUrl}img/undraw_react.svg`,
            imageAlign: 'top',
            title: 'Seamless Embedding',
          },
          {
            content: 'Control the notebook through an extensive JavaScript API. You can, for instance, change the value of a [Manipulate](https://reference.wolfram.com/language/ref/Manipulate.html) variable, open and close cell groups or evaluate [Wolfram Language](https://www.wolfram.com/language/) expressions from your JavaScript code.',
            image: `${baseUrl}img/undraw_operating_system.svg`,
            imageAlign: 'top',
            title: 'Scriptable Control',
          },
        ]}
      </Block>
    );

    const Showcase = () => {
      if ((siteConfig.users || []).length === 0) {
        return null;
      }

      const showcase = siteConfig.users
        .filter(user => user.pinned)
        .map(user => (
          <a href={user.infoLink} key={user.infoLink}>
            <img src={user.image} alt={user.caption} title={user.caption} />
          </a>
        ));

      const pageUrl = page => baseUrl + (language ? `${language}/` : '') + page;

      return (
        <div className="productShowcaseSection paddingBottom">
          <h2>Who Is Using This?</h2>
          <p>Notebooks are embedded on all these sites:</p>
          <div className="logos">{showcase}</div>
          <div className="more-users">
            <a className="button" href={pageUrl('users.html')}>
              More {siteConfig.title} Users
            </a>
          </div>
        </div>
      );
    };

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <Features />
          {/*<FeatureCallout />*/}
          {/*<LearnHow />*/}
          {/*<TryOut />*/}
          <Description />
          <Showcase />
        </div>
      </div>
    );
  }
}

module.exports = Index;
