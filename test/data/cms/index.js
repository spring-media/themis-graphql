module.exports = {
  name: 'cms',
  accessViaContext: 'cmsSchema',
  mount: false,
  remote: {
    uri: 'http://127.0.0.1:51234/api/graphql',
  },
};
