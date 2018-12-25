const React = require('react');
const CompLibrary = require('../../core/CompLibrary.js');
const Container = CompLibrary.Container;

class Roadmap extends React.Component {
  render() {
    return (
      <div className="wrapper">
        <Container 
          className="mainContainer documentContainer postContainer"
        >
          <div className="post">
            <header className="postHeader">
              <h1>Roadmap</h1>
            </header>
            <div>
            <h2>v0.3</h2>
            <ul>
              <li>Persisted Queries</li>
              <li>Query depth limiting</li>
              <li>Subscription transport middlewares</li>
            </ul>
            <h2>v0.4</h2>
            <ul>
              <li>--no-extend flag to start modules without their type extensions (no dependency check)</li>
              <li>Development watch mode for modules</li>
              <li>Port to Typescript</li>
            </ul>
          </div>
          </div>
        </Container>
      </div>
    );
  }
}

module.exports = Roadmap;
