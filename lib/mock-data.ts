import { ContentItem, ResearchUrl, UserSettings } from './types';

export const mockContent: ContentItem[] = [
  {
    id: '1',
    platform: 'IGFB',
    contentType: 'Local',
    topic: 'Top 5 Coffee Shops in Salt Lake City',
    generatedText: 'Looking for the perfect spot to discuss your real estate goals? ☕ Here are my favorite local coffee shops where I love meeting clients:\n\n1. Publik Coffee - Amazing atmosphere in downtown SLC\n2. Blue Copper Coffee - Best pour-over in the valley\n3. Campos Coffee - Hidden gem in Sugar House\n4. Coffee Break - Family-owned and welcoming\n5. The Rose Establishment - Perfect for brunch meetings\n\nWhich one should we meet at? Drop a comment below! 👇\n\n#SaltLakeCity #UtahRealEstate #LocalLove #SLCCoffee',
    publishDate: '2026-02-03',
    publishTime: '9:00 AM',
    status: 'draft',
    owner: 'Liz Sears'
  },
  {
    id: '2',
    platform: 'LinkedIn',
    contentType: 'Market',
    topic: 'Utah Real Estate Market Update - January 2026',
    generatedText: 'The Utah housing market continues to show resilience heading into 2026.\n\nKey observations from January:\n\n📊 Market Stats:\n• Median home price: $525,000 (up 3.2% YoY)\n• Average days on market: 28 days\n• Inventory levels: Up 15% from 2025\n\n🏠 What this means for buyers:\nMore options are becoming available, but desirable properties still move quickly. Pre-approval is essential.\n\n🏡 What this means for sellers:\nStrategic pricing remains critical. Well-staged homes in prime locations continue to see multiple offers.\n\nThinking about making a move in 2026? Let\'s connect and discuss your strategy.\n\n#UtahRealEstate #RealEstateMarket #SaltLakeCity #HomeBuying #HomeSelling',
    publishDate: '2026-02-03',
    publishTime: '10:00 AM',
    status: 'draft',
    owner: 'Liz Sears'
  },
  {
    id: '3',
    platform: 'Blog',
    contentType: 'Educational',
    topic: 'First-Time Homebuyer Guide: Understanding Closing Costs in Utah',
    generatedText: '# First-Time Homebuyer Guide: Understanding Closing Costs in Utah\n\nBuying your first home is exciting, but understanding all the costs involved can feel overwhelming. One area that often surprises first-time buyers is closing costs.\n\n## What Are Closing Costs?\n\nClosing costs are fees and expenses you pay when finalizing your home purchase. In Utah, these typically range from 2-5% of the home\'s purchase price.\n\n## Common Closing Costs in Utah\n\n### Lender Fees\n- Loan origination fee (0.5-1% of loan amount)\n- Credit report fee ($30-50)\n- Appraisal fee ($400-600)\n\n### Title and Settlement\n- Title insurance ($500-1,500)\n- Settlement/escrow fee ($400-800)\n- Recording fees ($50-150)\n\n### Prepaid Items\n- Homeowner\'s insurance (first year premium)\n- Property taxes (prorated)\n- Prepaid interest\n\n## Tips to Reduce Closing Costs\n\n1. Shop around for lenders\n2. Negotiate with the seller\n3. Ask about first-time buyer programs\n4. Review the Loan Estimate carefully\n\nHave questions about closing costs? Reach out - I\'m here to help!',
    publishDate: '2026-02-04',
    publishTime: '8:00 AM',
    status: 'draft',
    owner: 'Liz Sears'
  },
  {
    id: '4',
    platform: 'YouTube',
    contentType: 'Educational',
    topic: 'Home Tour: Modern Farmhouse in Draper',
    generatedText: '[VIDEO SCRIPT]\n\nINTRO:\n"Hey everyone! Welcome back to Utah\'s Elite Realtors. Today I\'m bringing you an exclusive tour of this stunning modern farmhouse in Draper."\n\nMAIN CONTENT:\n"This 4-bedroom, 3-bath home features:\n- Open concept living with 12-foot ceilings\n- Chef\'s kitchen with quartz countertops\n- Primary suite with mountain views\n- Finished basement with home theater\n- Beautiful backyard with covered patio"\n\nKEY FEATURES TO HIGHLIGHT:\n1. Location - minutes from I-15 and great schools\n2. Modern finishes throughout\n3. Energy-efficient features\n4. Mountain and valley views\n\nCALL TO ACTION:\n"If you\'re interested in this home or want to see similar properties, hit subscribe and drop a comment below. And don\'t forget to schedule your private showing!"',
    publishDate: '2026-02-04',
    publishTime: '12:00 PM',
    status: 'approved',
    owner: 'Liz Sears'
  },
  {
    id: '5',
    platform: 'IGFB',
    contentType: 'Personal',
    topic: 'Why I Love Being a Utah Realtor',
    generatedText: 'Five years ago, I made the best decision of my career - becoming a realtor in Utah. 🏔️\n\nHere\'s what I love about it:\n\n✨ Helping families find their dream homes\n✨ The incredible Utah community\n✨ Every day is different\n✨ Building lasting relationships with my clients\n✨ These mountain views never get old!\n\nTo everyone who has trusted me with their home journey - THANK YOU! 🙏\n\nWhat do you love most about living in Utah? Tell me in the comments!\n\n#UtahRealtor #GratefulHeart #SaltLakeCity #RealEstateLife #UtahLiving',
    publishDate: '2026-02-05',
    publishTime: '6:00 PM',
    status: 'draft',
    owner: 'Liz Sears'
  },
  {
    id: '6',
    platform: 'LinkedIn',
    contentType: 'Educational',
    topic: '5 Questions Every Home Seller Should Ask Their Agent',
    generatedText: 'Choosing the right real estate agent can make or break your home sale.\n\nBefore you sign a listing agreement, ask these 5 essential questions:\n\n1️⃣ "What\'s your marketing strategy for my specific property?"\nLook for agents who customize their approach, not one-size-fits-all solutions.\n\n2️⃣ "How will you determine the listing price?"\nExpect a detailed CMA (Comparative Market Analysis), not just a gut feeling.\n\n3️⃣ "What\'s your average days-on-market vs. the local average?"\nData tells the story of an agent\'s effectiveness.\n\n4️⃣ "How will you communicate with me throughout the process?"\nClear expectations prevent frustration later.\n\n5️⃣ "Can you provide references from recent clients?"\nReputation matters. Ask for them.\n\nThinking about selling? I\'m happy to answer these questions and more.\n\n#RealEstateTips #HomeSelling #UtahRealEstate #RealtorAdvice',
    publishDate: '2026-02-05',
    publishTime: '9:00 AM',
    status: 'draft',
    owner: 'Liz Sears'
  },
  {
    id: '7',
    platform: 'IGFB',
    contentType: 'Market',
    topic: 'Neighborhood Spotlight: Sugar House',
    generatedText: 'NEIGHBORHOOD SPOTLIGHT: Sugar House 🏘️\n\nOne of SLC\'s most beloved neighborhoods, and for good reason!\n\n📍 Location: Southeast Salt Lake City\n\n🏠 What You\'ll Find:\n• Charming bungalows to modern new builds\n• Price range: $450K - $900K+\n• Walkable streets with mature trees\n\n🎯 Why People Love It:\n✅ Sugar House Park (perfect for families!)\n✅ Vibrant local shops and restaurants\n✅ Easy access to downtown and ski resorts\n✅ Strong sense of community\n✅ Great schools nearby\n\n🚗 Commute Times:\n• Downtown SLC: 10 min\n• Salt Lake Airport: 20 min\n• Park City: 40 min\n\nConsidering Sugar House? I\'d love to show you around! DM me to schedule a tour. 🏡\n\n#SugarHouse #SaltLakeCity #UtahHomes #NeighborhoodGuide',
    publishDate: '2026-02-06',
    publishTime: '11:00 AM',
    status: 'draft',
    owner: 'Liz Sears'
  },
  {
    id: '8',
    platform: 'Blog',
    contentType: 'Market',
    topic: '2026 Utah Real Estate Predictions',
    generatedText: '# 2026 Utah Real Estate Predictions: What to Expect This Year\n\nAs we settle into 2026, many buyers and sellers are wondering what the Utah real estate market has in store. Here\'s my analysis based on current trends and economic indicators.\n\n## Interest Rates\n\nAfter the volatility of recent years, rates are expected to stabilize in the 5.5-6.5% range. While not as low as the pandemic era, this provides predictability for buyers planning their purchases.\n\n## Home Prices\n\nI predict modest appreciation of 3-5% in the Salt Lake metro area. Factors supporting this:\n- Continued in-migration to Utah\n- Limited buildable land in prime areas\n- Strong local economy\n\n## Inventory Levels\n\nExpect improvement here. More sellers are entering the market, providing relief for frustrated buyers.\n\n## Hot Markets to Watch\n\n1. **Daybreak** - Family-friendly planned community\n2. **South Jordan** - Great schools, growing amenities\n3. **Herriman** - Affordable options, room to grow\n4. **Holladay** - Established luxury market\n\n## My Advice\n\n**For Buyers:** Don\'t wait for "perfect" conditions. Today\'s rates are historically reasonable.\n\n**For Sellers:** Price strategically from day one. Overpricing costs you time and money.\n\nWant to discuss your specific situation? Let\'s connect!',
    publishDate: '2026-02-06',
    publishTime: '8:00 AM',
    status: 'approved',
    owner: 'Liz Sears'
  },
  {
    id: '9',
    platform: 'YouTube',
    contentType: 'Local',
    topic: 'Best Family-Friendly Neighborhoods in Salt Lake County',
    generatedText: '[VIDEO SCRIPT]\n\nINTRO:\n"Looking for the perfect neighborhood to raise your family in Salt Lake County? I\'ve got you covered! Let\'s explore the top 5 family-friendly areas."\n\nNEIGHBORHOOD 1 - COTTONWOOD HEIGHTS:\n- Excellent schools (Granite School District)\n- Quick access to Big and Little Cottonwood Canyons\n- Median home price: $650K\n\nNEIGHBORHOOD 2 - DAYBREAK:\n- Planned community with parks and trails\n- Strong HOA maintains property values\n- Median home price: $500K\n\nNEIGHBORHOOD 3 - HOLLADAY:\n- Established neighborhood charm\n- Top-rated schools\n- Median home price: $750K\n\nNEIGHBORHOOD 4 - SANDY:\n- Diverse housing options\n- Great recreation facilities\n- Median home price: $550K\n\nNEIGHBORHOOD 5 - SOUTH JORDAN:\n- Rapidly growing with new amenities\n- Family-focused community events\n- Median home price: $575K\n\nOUTRO:\n"Which neighborhood interests you most? Comment below, and I\'ll create a detailed tour of your top pick!"',
    publishDate: '2026-02-07',
    publishTime: '2:00 PM',
    status: 'draft',
    owner: 'Liz Sears'
  },
  {
    id: '10',
    platform: 'LinkedIn',
    contentType: 'Promotional',
    topic: 'Just Listed: Stunning Mountain View Home in Sandy',
    generatedText: '🏡 JUST LISTED: Sandy, UT\n\nExcited to bring this stunning property to market!\n\n📍 Address: 1234 Mountain View Dr, Sandy, UT\n💰 Price: $699,000\n🛏️ Beds: 5\n🛁 Baths: 3.5\n📐 Sq Ft: 3,200\n\nHighlights:\n✓ Unobstructed mountain views from every level\n✓ Completely remodeled kitchen (2025)\n✓ Main floor primary suite\n✓ Finished walkout basement\n✓ 0.35 acre lot with mature landscaping\n✓ Top-rated Canyons School District\n\nThis one won\'t last long. Private showings now available.\n\nInterested? DM me or comment below for more details.\n\n#JustListed #SandyUtah #UtahRealEstate #MountainViews #DreamHome',
    publishDate: '2026-02-07',
    publishTime: '10:00 AM',
    status: 'draft',
    owner: 'Liz Sears'
  },
  {
    id: '11',
    platform: 'IGFB',
    contentType: 'Educational',
    topic: 'Home Staging Tips That Actually Work',
    generatedText: '📸 STAGING SECRETS from a realtor who\'s seen it all!\n\nWant to sell faster and for more money? Here are my top staging tips:\n\n1️⃣ DECLUTTER RUTHLESSLY\nLess is more. Box up 50% of your stuff. Yes, really.\n\n2️⃣ NEUTRALIZE COLORS\nThat bold accent wall? Time for a fresh coat of greige.\n\n3️⃣ LET IN THE LIGHT\nOpen blinds, add lamps, make it bright and welcoming.\n\n4️⃣ STAGE THE PRIMARY SUITE\nWhite bedding, minimal furniture, spa-like bathroom.\n\n5️⃣ CURB APPEAL MATTERS\nFresh mulch, potted plants, pressure-washed driveway.\n\n💡 PRO TIP: Stand in your doorway and take a photo. You\'ll see your home the way buyers do!\n\nWant a free staging consultation? DM me! 📱\n\n#HomeStagingTips #SellYourHome #RealEstateTips #UtahRealtor',
    publishDate: '2026-02-08',
    publishTime: '4:00 PM',
    status: 'scheduled',
    owner: 'Liz Sears'
  },
  {
    id: '12',
    platform: 'Blog',
    contentType: 'Educational',
    topic: 'Understanding HOAs: What Utah Buyers Need to Know',
    generatedText: '# Understanding HOAs: What Utah Buyers Need to Know\n\nHomeowners Associations (HOAs) are common in Utah, especially in newer developments. Before buying in an HOA community, here\'s what you need to understand.\n\n## What is an HOA?\n\nAn HOA is an organization that manages a community and enforces rules (CC&Rs - Covenants, Conditions, and Restrictions).\n\n## Typical Utah HOA Fees\n\n- Single-family homes: $30-150/month\n- Townhomes: $150-300/month\n- Condos: $200-500/month\n\n## What Do HOA Fees Cover?\n\nThis varies widely, but may include:\n- Common area maintenance\n- Landscaping (sometimes)\n- Community amenities (pools, clubhouses)\n- Snow removal\n- Exterior maintenance (townhomes/condos)\n\n## Red Flags to Watch For\n\n⚠️ Low reserves (should be 25%+ of annual budget)\n⚠️ Pending special assessments\n⚠️ Multiple lawsuits\n⚠️ High delinquency rates\n⚠️ Restrictive rules that don\'t match your lifestyle\n\n## Questions to Ask\n\n1. Can I see the last 2 years of meeting minutes?\n2. Are there any pending special assessments?\n3. What\'s the reserve fund balance?\n4. Have there been recent rule changes?\n5. What\'s the violation process?\n\n## My Advice\n\nAlways review HOA documents during your due diligence period. I help my clients understand these documents and identify potential issues.\n\nHave questions about a specific HOA? Reach out!',
    publishDate: '2026-02-09',
    publishTime: '8:00 AM',
    status: 'draft',
    owner: 'Liz Sears'
  }
];

export const mockResearchUrls: ResearchUrl[] = [
  {
    id: '1',
    url: 'https://answerthepublic.com/reports/?search=utah%20real%20estate',
    title: 'AnswerThePublic - Utah Real Estate',
    category: 'Market Research',
    scrapeFrequency: 'weekly',
    isActive: true,
    lastScraped: '2026-01-20T10:00:00Z'
  },
  {
    id: '2',
    url: 'https://www.ksl.com/real-estate',
    title: 'KSL Real Estate News',
    category: 'Local News',
    scrapeFrequency: 'daily',
    isActive: true,
    lastScraped: '2026-01-27T08:00:00Z'
  },
  {
    id: '3',
    url: 'https://www.utahrealestate.com/market-statistics',
    title: 'Utah Real Estate Market Statistics',
    category: 'Market Research',
    scrapeFrequency: 'weekly',
    isActive: true,
    lastScraped: '2026-01-25T14:30:00Z'
  },
  {
    id: '4',
    url: 'https://www.sltrib.com/news/real-estate/',
    title: 'Salt Lake Tribune - Real Estate',
    category: 'Local News',
    scrapeFrequency: 'daily',
    isActive: false,
    lastScraped: '2026-01-15T09:00:00Z'
  },
  {
    id: '5',
    url: 'https://www.zillow.com/salt-lake-city-ut/home-values/',
    title: 'Zillow SLC Home Values',
    category: 'Competitor Analysis',
    scrapeFrequency: 'monthly',
    isActive: true,
    lastScraped: '2026-01-01T00:00:00Z'
  }
];

export const mockUserSettings: UserSettings = {
  weeklyGenerationDay: 0, // Sunday
  weeklyGenerationTime: '18:00',
  autoApproveEnabled: false,
  notificationEmail: 'liz@utahseliterealtors.com',
  forbiddenPhrases: [
    'guaranteed',
    'best in Utah',
    'lowest prices',
    'act now',
    'limited time'
  ]
};

// Platform colors for consistent styling
export const platformColors: Record<string, { bg: string; text: string; border: string }> = {
  IGFB: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  LinkedIn: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  Blog: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  YouTube: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' }
};

// Platform emojis
export const platformEmojis: Record<string, string> = {
  IGFB: '📸',
  LinkedIn: '💼',
  Blog: '📝',
  YouTube: '🎬'
};

// Status colors
export const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700' },
  approved: { bg: 'bg-green-100', text: 'text-green-700' },
  published: { bg: 'bg-blue-100', text: 'text-blue-700' },
  scheduled: { bg: 'bg-yellow-100', text: 'text-yellow-700' }
};
