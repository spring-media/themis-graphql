const gql = require('graphql-tag')

module.exports = gql`
  scalar JSON

  type Query {
    # Fetch specific article by id and version
    article (id: ID! version: Int): Article
  }

  # The delivery slate richtext-type
  type DeliverySlateJS {
    type: String
    typeVersion: String
    data: JSON
    demoAdditionalDeliveryField: String
  }

  # Base interface for article
  interface BaseArticle {
    documentType: String
    creationDate: String
    modificationDate: String
    id: ID
  }

  # Type for a basic article at article edit page
  type Article implements BaseArticle {
    documentType: String
    version: Int
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
    editors: [String]
    editorsDone: [String]
    # The user who made the force checkin
    forcedCheckinBy: String
    publicationBlocked: Boolean
    adState: String
    noIndexNoFollow: Boolean
    # The kicker of an article in plaintext format
    kicker: String
    headline: DeliverySlateJS
    headlinePlain: String
    subcell: DeliverySlateJS
    subcellPlain: String
    text: DeliverySlateJS
    title: String
    metaDescription: String
    readyToReview: Boolean
    author: String
    displayDate: String
    # Formally known as coreMediaId
    externalId: String
    
    # This attribute was originally named cmsId
    id: ID

    # This attribute is only for demonstration proposes.
    # It explains how to add virtual attributes
    versionId: String
    pageTitle: String

    premium: String
    conversionText: DeliverySlateJS

    # Indicates if the context user is currently editing the article
    checkedOutByMe: Boolean

    slateState: JSON
  }
`
