import { gql } from "@apollo/client";

const GET_ALL_PAGES = gql`
  query AllPages {
    pages {
      nodes {
        id
        title
        slug
        uri
        content
        featuredImage {
          node {
            sourceUrl
          }
        }
      }
    }
  }
`;

const GET_CURRENT_USER = gql`
  query Viewer {
    viewer {
      id
      name
      email
    }
  }
`;

// Logout mutation (invalidate session)
const LOGOUT = gql`
  mutation Logout {
    logout {
      status
    }
  }
`;

// 2. Get Page Slugs Only
const GET_PAGE_SLUGS = gql`
  query PageSlugs {
    pages {
      nodes {
        slug
      }
    }
  }
`;

// 3. Get Page Details by Slug
const GET_PAGE_DETAILS = (slug) => gql`
  query PageDetails {
    page(id: "${slug}", idType: SLUG) {
      id
      title
      slug
      uri
      content
      featuredImage {
        node {
          sourceUrl
        }
      }
    }
  }
`;

const GET_ALL = gql`
  query Products {
    products(first: 100) {
      nodes {
        id
        name
        slug
        ... on SimpleProduct {
          price(format: RAW)
          salePrice(format: RAW)
        regularPrice(format: RAW)
          featuredImage {
            node {
              sourceUrl
            }
          }
          galleryImages {
            nodes {
              sourceUrl
            }
          }
          attributes {
            nodes {
              id
              name
              label
              options
            }
          }
          productCategories {
            nodes {
              id
              name
              slug
            }
          }
        }
        ... on VariableProduct {
          price(format: RAW)
          salePrice(format: RAW)
          regularPrice(format: RAW)
          featuredImage {
            node {
              sourceUrl
            }
          }
          productTags {
          nodes {
            id
            name
            slug
          }
        }
        productCategories(first: 10) {
          nodes {
            id
            name
            slug
          }
        }
          galleryImages {
            nodes {
              sourceUrl
            }
          }
          attributes {  
            nodes {
              id
              name
              label
              options
            }
          }
          variations {
            nodes {
              id
              name
              price(format: RAW)
              regularPrice(format: RAW)
              salePrice(format: RAW)
              sku
              attributes {
                nodes {
                  id
                  name
                  label
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

const GET_SEARCH_PRODUCTS = gql`
  query SearchProducts {
    products(first: 10) {
      nodes {
        id
        name
        slug

        featuredImage {
          node {
            sourceUrl
          }
        }

        productCategories(first: 10) {
          nodes {
            id
            name
            slug
          }
        }

        ... on SimpleProduct {
          price(format: RAW)
        }

        ... on VariableProduct {
          price(format: RAW)
        }
      }
    }
  }
`;


const GET_SLUG = gql`
  query GetProductSlugs {
    products(first: 100) {
      nodes {
        slug
      }
    }
  }
`;

const GET_PRODUCT_DETAILS = (slug) => gql`
  query GetProductDetails {
    product(id: "${slug}", idType: SLUG) {
      id
      name
      description
      slug
      seo {
        title
        metaDesc
        metaKeywords
        opengraphImage {
          sourceUrl
        }
      }
        productTags {
          nodes {
            id
            name
          }
        }
        productCategories {
          nodes {
            id
            name
            slug
          }
        }

      ... on SimpleProduct {
        price(format: RAW)
        salePrice(format: RAW)
        regularPrice(format: RAW)
        featuredImage {
          node {
            sourceUrl
          }
        }
        productTags {
          nodes {
            id
            name
          }
        }
        productCategories {
          nodes {
            id
            name
            slug
          }
        }
        galleryImages {
          nodes {
            sourceUrl
          }
        }
        attributes {
          nodes {
            id
            name
            options
          }
        }
      }

      ... on VariableProduct {
        price(format: RAW)
        salePrice(format: RAW)
        regularPrice(format: RAW)
        featuredImage {
          node {
            sourceUrl
          }
        }
        productTags {
          nodes {
            id
            name
          }
        }
        productCategories {
          nodes {
            id
            name
            slug
          }
        }
        galleryImages {
          nodes {
            sourceUrl
          }
        }
        attributes {
          nodes {
            id
            name
            options
          }
        }
        variations(first: 100) {
          nodes {
            id
            name
            image {
              sourceUrl
            }
            sku
            attributes {
              nodes {
                name
                value
              }
            }
            metaData {
              key
              value
            }
          }
        }
      }

      ... on ExternalProduct {
        price(format: RAW)
        featuredImage {
          node {
            sourceUrl
          }
        }
      }

      ... on GroupProduct {
        featuredImage {
          node {
            sourceUrl
          }
        }
      }
      shortDescription
    }
  }
`;

const GET_postId = gql`
    query CategoryPosts {
      category(id: "postIds", idType: NAME) {
        id
        name
        posts {
          nodes {
            id
            title
            excerpt
            uri
            featuredImage {
              node {
                sourceUrl
              }
            }
          }
        }
      }
    }
`;

export { GET_ALL_PAGES, GET_PAGE_SLUGS, GET_PAGE_DETAILS, GET_ALL, GET_SLUG, GET_PRODUCT_DETAILS, GET_postId, GET_CURRENT_USER, LOGOUT, GET_SEARCH_PRODUCTS };
