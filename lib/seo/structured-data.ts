// JSON-LD structured data generators
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AlgoRise",
  url: "https://www.myalgorise.in",
  logo: "https://www.myalgorise.in/logo.png",
  description: "Master competitive programming with adaptive practice, real-time contests, and AI-powered analytics.",
  sameAs: ["https://twitter.com/AlgoRise", "https://github.com/Hackeries/AlgoRise"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Support",
    email: "support@myalgorise.in",
  },
})

export const generateWebApplicationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AlgoRise",
  description: "Master competitive programming with adaptive practice, real-time contests, and AI-powered analytics.",
  url: "https://www.myalgorise.in",
  applicationCategory: "EducationalApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1250",
  },
})

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
})

export const generateArticleSchema = (
  title: string,
  description: string,
  image: string,
  datePublished: string,
  dateModified: string,
  author: string,
) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description,
  image,
  datePublished,
  dateModified,
  author: {
    "@type": "Person",
    name: author,
  },
})

export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
})
