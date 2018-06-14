const gql = require('graphql-tag');

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

  type TaxonomyNode {
		id: ID
		name: String
		path: [String]
	}

  type ImageElement {
		id: ID
		width: Int
		height: Int
		renderUrl: String
		aspectRatio: String
		caption: DeliverySlateJS
		source: String
	}
  
  type EmbedElement {
		id: ID
		lastModified: String
		modCounter: Int
		embedType: String
		url: String
	}

  union Lead = ImageElement | EmbedElement

  # Type for a Delivery Article 
  # For the largest part, the article is populated with data from LeanCMS
  type Article implements BaseArticle {
    documentType: String
    
    # An article can be in a specific state (checkedIn, checkedOut, published)
    state: String
    # The Date, when the article was created
    creationDate: String
    # The last Date, when the article has been published
    publicationDate: String,
    # The Date, when the article has been published for the first time
    firstPublicationDate: String,
    # The Date, when the article was modified
    modificationDate: String
    
    editors: [String]
		
    adState: String
    noIndexNoFollow: Boolean
    
    # The kicker of an article in plaintext format
    kicker: String
    headline: DeliverySlateJS
    headlinePlain: String
    subcell: DeliverySlateJS
    subcellPlain: String
    text: DeliverySlateJS
    lead: Lead
		
    # Meta data
    title: String
    # Meta data
    metaDescription: String
    
    canonicalLink: String
		
    taxonomyNodes: [TaxonomyNode]
    
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
`;
