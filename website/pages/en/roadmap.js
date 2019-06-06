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
              <li>Merge strategies (default and custom ways to mold modules into one executable schema)</li>
              <li>Persisted Queries</li>
              <li>Custom Directives (handover to graphql-tools from module)</li>
            </ul>
            <h2>v0.4</h2>
            <ul>
              <li>Query depth limiting</li>
              <li>Query complexity/execution cost limiting</li>
              <li>Subscription transport middlewares</li>
              <li>(--no-extend flag to start modules without their type extensions (no dependency check))</li>
              <li>Development watch mode for modules</li>
            </ul>
            <h2>Not Scheduled</h2>
            <ul>
              <li>Port to Typescript</li>
              <li>Allow global install to detect local themis installations and use the local one.</li>
              <li>Windows Support</li>
            </ul>
          </div>
          </div>
        </Container>
      </div>
    );
  }
}

module.exports = Roadmap;
