// Mock Amazon book data fetching service
// In a real implementation, this would integrate with Amazon's API or web scraping

interface MockBook {
  asin: string
  title: string
  publisher: string
  price: number
  bsr: number
  reviewCount: number
  publicationDate: string
}

const publisherTypes = [
  "Independent",
  "Self-Published",
  "Penguin Random House",
  "HarperCollins",
  "Simon & Schuster",
  "Macmillan",
  "Hachette",
  "Independent Publishing",
  "CreateSpace Independent",
]

const generateMockASIN = () => {
  return "B0" + Math.random().toString(36).substring(2, 10).toUpperCase()
}

const generateMockTitle = (keyword: string) => {
  const templates = [
    `The Complete Guide to ${keyword}`,
    `${keyword}: A Beginner's Handbook`,
    `Mastering ${keyword} in 30 Days`,
    `${keyword} Made Simple`,
    `The Ultimate ${keyword} Workbook`,
    `${keyword}: Secrets Revealed`,
    `Advanced ${keyword} Strategies`,
    `${keyword} for Dummies`,
    `The ${keyword} Bible`,
    `${keyword}: Step by Step Guide`,
  ]

  return templates[Math.floor(Math.random() * templates.length)]
}

export async function mockAmazonBookFetch(keyword: string): Promise<MockBook[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

  const bookCount = 30 + Math.floor(Math.random() * 70) // 30-100 books
  const books: MockBook[] = []

  for (let i = 0; i < bookCount; i++) {
    const isIndependent = Math.random() < 0.75 // 75% chance of being independent/self-published
    const publisher = isIndependent
      ? publisherTypes[Math.floor(Math.random() * 3)] // First 3 are independent
      : publisherTypes[3 + Math.floor(Math.random() * (publisherTypes.length - 3))]

    // Generate realistic BSR distribution (most books have higher BSR)
    let bsr: number
    const rand = Math.random()
    if (rand < 0.05) {
      // 5% top performers
      bsr = Math.floor(Math.random() * 10000) + 1
    } else if (rand < 0.2) {
      // 15% good performers
      bsr = Math.floor(Math.random() * 90000) + 10000
    } else if (rand < 0.5) {
      // 30% average performers
      bsr = Math.floor(Math.random() * 400000) + 100000
    } else {
      // 50% poor performers
      bsr = Math.floor(Math.random() * 1000000) + 500000
    }

    const price = 5.99 + Math.random() * 20 // $5.99 - $25.99
    const reviewCount = Math.floor(Math.random() * 500)

    // Generate publication date (last 2 years, weighted toward recent)
    const daysAgo = Math.floor(Math.random() * 730)
    const publicationDate = new Date()
    publicationDate.setDate(publicationDate.getDate() - daysAgo)

    books.push({
      asin: generateMockASIN(),
      title: generateMockTitle(keyword),
      publisher,
      price: Math.round(price * 100) / 100,
      bsr,
      reviewCount,
      publicationDate: publicationDate.toISOString().split("T")[0],
    })
  }

  // Sort by BSR (best sellers first)
  return books.sort((a, b) => a.bsr - b.bsr)
}
