export type BlogSection = {
  heading: string;
  body: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  category: string;
  keywords: string[];
  relatedCategory: {
    label: string;
    href: string;
  };
  intro: string;
  sections: BlogSection[];
  faqs: {
    question: string;
    answer: string;
  }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-find-reliable-electrician-in-bangladesh",
    title: "How to Find and Hire a Reliable Electrician in Bangladesh",
    description:
      "Essential guide for homeowners in Bangladesh looking to hire safe, qualified electricians for wiring, switchboard repairs, and home electrical safety.",
    publishedAt: "2026-07-20",
    updatedAt: "2026-07-20",
    readingTime: "4 min read",
    category: "Electrical & Wiring",
    keywords: ["electrician bangladesh", "electrician dhaka", "wiring mistri", "home electrical safety"],
    relatedCategory: { label: "Electrician Directory", href: "/workers/electrician" },
    intro:
      "Finding a trustworthy electrician for short circuits, fan installations, or full building wiring is critical for household safety in Bangladesh. A quick repair by an inexperienced technician can lead to recurring power trips or electrical hazards.",
    sections: [
      {
        heading: "Check Practical Experience & Specialized Skills",
        body: [
          "Before handing over major electrical work, ask the technician about their experience with single-phase vs three-phase wiring, circuit breaker setups, and load distribution.",
          "Experienced electricians in Dhaka and other major cities understand local line fluctuations and will recommend proper gauge copper wiring and reliable circuit breakers.",
        ],
      },
      {
        heading: "Prioritize Safety Equipment & Grounding",
        body: [
          "Ensure your electrician verifies earthing (grounding) connections during home wiring upgrades. Proper earthing prevents dangerous electrical shocks during refrigerator or water heater usage.",
          "Professional technicians inspect main distribution boards and ensure earth leakage circuit breakers (ELCBs) function properly.",
        ],
      },
    ],
    faqs: [
      {
        question: "What should I ask an electrician before hiring?",
        answer:
          "Ask about their trade experience, past residential projects, and estimation for labor vs material costs.",
      },
      {
        question: "Why does my circuit breaker keep tripping?",
        answer:
          "Frequent breaker trips are usually caused by overloaded circuits, short circuits in appliances, or loose wire connections requiring an electrician's inspection.",
      },
    ],
  },
  {
    slug: "essential-plumbing-tips-for-homeowners-in-dhaka",
    title: "Essential Plumbing Maintenance Tips for Homeowners in Bangladesh",
    description:
      "Learn how to prevent clogged pipes, inspect water pumps, and choose skilled plumbers for bathroom and kitchen repairs in Bangladesh.",
    publishedAt: "2026-07-18",
    updatedAt: "2026-07-18",
    readingTime: "5 min read",
    category: "Plumbing Services",
    keywords: ["plumber bangladesh", "plumbing mistri", "water line repair", "bathroom pipe repair"],
    relatedCategory: { label: "Plumber Directory", href: "/workers/plumber" },
    intro:
      "Plumbing emergencies like leaking overhead tanks, broken sanitary fittings, or clogged drainage pipes can disrupt daily family life. Regular maintenance and knowing when to call a skilled plumber save time and money.",
    sections: [
      {
        heading: "Maintaining Water Pumps & Overhead Tanks",
        body: [
          "In Bangladesh, water supply often depends on underground reservoirs and roof tanks. Inspecting pump foot valves and float switches twice a year prevents motor burnouts and dry running.",
          "Clearing sediment built up inside water tanks ensures clean supply for drinking and sanitation.",
        ],
      },
      {
        heading: "Dealing with Hard Water & Mineral Clogs",
        body: [
          "High iron content in water across several regions can cause scale buildup inside PPR and PVC pipes. Flushing aerators and showerheads periodically maintains water pressure.",
        ],
      },
    ],
    faqs: [
      {
        question: "How do I find a local plumber near me?",
        answer:
          "You can search Sromojibi's worker directory by district and specialty to connect directly with nearby plumbers.",
      },
    ],
  },
  {
    slug: "guide-to-hiring-rajmistri-civil-construction",
    title: "Complete Guide to Hiring a Rajmistri for Construction & Remodeling",
    description:
      "Everything you need to know when hiring a head mason (Rajmistri) for bricklaying, plastering, and civil building work in Bangladesh.",
    publishedAt: "2026-07-15",
    updatedAt: "2026-07-15",
    readingTime: "6 min read",
    category: "Civil Construction",
    keywords: ["rajmistri", "rajmistri bangladesh", "masonry work", "brickwork mistri"],
    relatedCategory: { label: "Rajmistri Directory", href: "/workers/rajmistri" },
    intro:
      "A skilled Rajmistri (head mason) leads masonry, concrete work, and structural plastering for residential homes and commercial buildings across Bangladesh. Selecting an experienced mason ensures solid quality and long-lasting durability.",
    sections: [
      {
        heading: "Understanding the Role of a Rajmistri",
        body: [
          "The Rajmistri manages brick masonry, mortar ratios, beam shuttering alignment, and floor leveling. They supervise assistant workers (jogali) to execute construction plans efficiently.",
          "Verifying previous building projects and mortar mixing standards ensures structural safety.",
        ],
      },
      {
        heading: "Curing & Mortar Quality Standards",
        body: [
          "Proper water curing (tari) for at least 7 to 10 days after brickwork or plastering is essential in tropical weather conditions to achieve maximum strength.",
        ],
      },
    ],
    faqs: [
      {
        question: "How is Rajmistri labor calculated in Bangladesh?",
        answer:
          "Labor is commonly calculated on a daily rate (daily hazira) or on a square foot contract basis depending on job scope.",
      },
    ],
  },
  {
    slug: "tiles-worker-buying-and-installation-guide",
    title: "Tiles Worker & Flooring Installation Guide for Homeowners",
    description:
      "Tips on selecting ceramic or porcelain tiles and hiring expert tiles workers for level, crack-free floor and wall installations.",
    publishedAt: "2026-07-10",
    updatedAt: "2026-07-10",
    readingTime: "5 min read",
    category: "Tiles & Flooring",
    keywords: ["tiles worker", "tiles mistri", "flooring installer bangladesh", "bathroom tile fitting"],
    relatedCategory: { label: "Tiles Worker Directory", href: "/workers/tiles-worker" },
    intro:
      "Tile installation requires precise leveling, accurate pattern cutting, and proper adhesive application. Hiring an experienced tiles worker ensures smooth joints and prevents hollow tiles.",
    sections: [
      {
        heading: "Preventing Hollow Tiles & Uneven Surfaces",
        body: [
          "Hollow spots occur when cement mortar or tile adhesive is unevenly spread underneath tiles. Professional tiles workers use notched trowels and tap tiles firmly into position.",
        ],
      },
      {
        heading: "Selecting Grout & Waterproofing",
        body: [
          "Bathroom floor tiles require proper slope towards the drain and waterproof grout sealing to prevent dampness in lower-level ceilings.",
        ],
      },
    ],
    faqs: [
      {
        question: "How long does floor tile installation take?",
        answer:
          "A standard room floor typically takes 1 to 2 days for tiling and 1 day for grouting and finishing.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
