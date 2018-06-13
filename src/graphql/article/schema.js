const gql = require('graphql-tag')

module.exports = gql`
  scalar JSON

  type Query {
    # Fetch specific article by id and version
    article (id: ID!): Article
  }

  # The delivery slate richtext-type
  type DeliverySlateJS {
    type: String
    typeVersion: String
    data: JSON
  }

  # Base interface for article
  interface BaseArticle {
    documentType: String
    creationDate: String
    modificationDate: String
    id: ID
  }

  # Type for a Delivery Article 
  # For the largest part, the article is populated with data from LeanCMS
  type Article implements BaseArticle {
    documentType: String
    
    # An article can be in a specific state (checkedIn, checkedOut, published)
    state: String
    # The Date, when the article was created
    creationDate: String
    # The Date, when the article was published
    publicationDate: String,
    # The Date, when the article was originally published
    firstPublicationDate: String,
    # The Date, when the article was modified
    modificationDate: String
    canonicalLink: String
    canonicalPath: String
    alternativePaths: [String]
    
    adState: String
    noIndexNoFollow: Boolean
    
    # The kicker of an article in plaintext format
    kicker: String
    headline: DeliverySlateJS
    headlinePlain: String
    subcell: DeliverySlateJS
    subcellPlain: String
    text: DeliverySlateJS
    
    # Meta data
    title: String
    # Meta data
    metaDescription: String
    
    author: String
    displayDate: String
    
    # This attribute was originally named cmsId
    id: ID

    pageTitle: String

    premium: String
    conversionText: DeliverySlateJS

    slateState: JSON

    # Just to demo how to add data from another endpoint to the schema
    extraRESTInfo: JSON
  }
`
