import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL || "";
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const categories = [
  {
    name: "Electrician",
    name_bn: "ইলেকট্রিশিয়ান",
    slug: "electrician",
    icon: "⚡",
    description: "Electrical wiring, DB box setup, fan & light installation, switchboard repair.",
  },
  {
    name: "Plumber",
    name_bn: "প্ল্যাম্বার",
    slug: "plumber",
    icon: "🚰",
    description: "Water pipe line installation, sanitary fitting, leak repair, and water pump setup.",
  },
  {
    name: "Rajmistri",
    name_bn: "রাজমিস্ত্রি",
    slug: "rajmistri",
    icon: "🏠",
    description: "Brickwork, building masonry, plastering, foundation, and structural civil works.",
  },
  {
    name: "Tiles Worker",
    name_bn: "টাইলস মিস্ত্রি",
    slug: "tiles-worker",
    icon: "🧱",
    description: "Floor tiles, wall tiles, marble, granite fitting, and bathroom waterproofing.",
  },
  {
    name: "Painter",
    name_bn: "রং মিস্ত্রি",
    slug: "painter",
    icon: "🎨",
    description: "Interior & exterior wall painting, putty finish, texture paint, and wood polish.",
  },
  {
    name: "Carpenter",
    name_bn: "কাঠ মিস্ত্রি",
    slug: "carpenter",
    icon: "🔨",
    description: "Furniture repair, door fitting, cabinet making, and wood craftsmanship.",
  },
  {
    name: "AC Technician",
    name_bn: "এসি টেকনিশিয়ান",
    slug: "ac-technician",
    icon: "❄️",
    description: "AC installation, servicing, gas refill, compressor repair, and maintenance.",
  },
  {
    name: "CCTV Installer",
    name_bn: "সিসিটিভি মিস্ত্রি",
    slug: "cctv-installer",
    icon: "📹",
    description: "CCTV camera setup, DVR configuration, security wiring, and IP camera installation.",
  },
  {
    name: "Day Labour",
    name_bn: "দিনমজুর (দৈনিক শ্রম)",
    slug: "day-labour",
    icon: "👷",
    description: "দৈনিক দিনমজুর, মাটি কাটা, নির্মাণ সহযোগী ও সাধারণ কায়িক শ্রমের অভিজ্ঞ কর্মী।",
  },
  {
    name: "Shifting Labour",
    name_bn: "বাসা বদল ও মালামাল লোডিং",
    slug: "shifting-labour",
    icon: "📦",
    description: "বাসা বা অফিস শিফটিং, মালামাল বহন, লোডিং-আনলোডিং ও প্যাকিং সহযোগী।",
  },
  {
    name: "Van Puller",
    name_bn: "ভ্যান চালক (পণ্য পরিবহন)",
    slug: "van-puller",
    icon: "🛺",
    description: "স্থানীয় এলাকায় স্বল্প দূরত্বের পণ্য ও মালামাল পরিবহনে অভিজ্ঞ ভ্যান ও ঠেলাগাড়ি চালক।",
  },
  {
    name: "Welder & Grill Mistri",
    name_bn: "ওয়েল্ডিং ও গ্রিল মিস্ত্রি",
    slug: "welder",
    icon: "👨‍🏭",
    description: "লোহার গ্রিল, বারান্দার খাঁচা, মেইন গেট, শাটার তৈরি ও মেটাল ওয়েল্ডিং বিশেষজ্ঞ।",
  },
  {
    name: "Thai Aluminium & Glass",
    name_bn: "থাই অ্যালুমিনিয়াম ও গ্লাস",
    slug: "aluminium-fabricator",
    icon: "🪟",
    description: "থাই গ্লাস, অ্যালুমিনিয়াম স্লাইডিং জানালা, পার্টিশন ও অফিস ক্যাবিন ফিটিং কারিগর।",
  },
  {
    name: "Deep Cleaner",
    name_bn: "ক্লিনার (ডিপ ক্লিনিং)",
    slug: "cleaner",
    icon: "🧹",
    description: "বাসা-বাড়ি, অফিস, রান্নাঘর, ওয়াশরুম ও ফ্লোর ডিপ ক্লিনিং কর্মী।",
  },
  {
    name: "Gypsum & Ceiling",
    name_bn: "জিপসাম ও সিলিং মিস্ত্রি",
    slug: "false-ceiling-worker",
    icon: "🏗️",
    description: "জিপসাম ফলস সিলিং ডিজাইন, পিভিসি সিলিং ও বোর্ড ডেকোরেশন মিস্ত্রি।",
  },
  {
    name: "Generator & Solar",
    name_bn: "জেনারেটর ও সোলার টেকনিশিয়ান",
    slug: "generator-solar",
    icon: "☀️",
    description: "সোলার প্যানেল সেটআপ, ব্যাটারি মেইনটেন্যান্স ও ডিজেল জেনারেটর সার্ভিসিং টেকনিশিয়ান।",
  },
  {
    name: "Gas Stove & Cylinder",
    name_bn: "গ্যাস চুলা ও সিলিন্ডার মিস্ত্রি",
    slug: "gas-technician",
    icon: "🔥",
    description: "এলপিজি ও পাইপলাইন গ্যাস চুলা মেরামত, অটো ইগনিশন ও রেগুলেটর সার্ভিসিং।",
  },
  {
    name: "Water Tank Cleaner",
    name_bn: "পানির ট্যাংক ক্লিনার",
    slug: "water-tank-cleaner",
    icon: "🚿",
    description: "আন্ডারগ্রাউন্ড ও ছাদের রিজার্ভ পানির ট্যাংক ওয়াশ ও ব্লিচিং ক্লিনিং টিম।",
  },
  {
    name: "Pickup & Mini Truck Driver",
    name_bn: "পিকআপ ও মিনি ট্রাক চালক",
    slug: "pickup-driver",
    icon: "🚚",
    description: "বাসা বদল, মালামাল পরিবহন ও জরুরি ট্রিপের অভিজ্ঞ পিকআপ ও মিনি ট্রাক চালক।",
  },
  {
    name: "Personal Car Driver",
    name_bn: "ব্যক্তিগত / রেন্ট-এ-কার ড্রাইভার",
    slug: "car-driver",
    icon: "🚗",
    description: "দৈনিক, মাসিক বা জরুরি চুক্তিতে অভিজ্ঞ ও লাইসেন্সধারী প্রাইভেট কার ড্রাইভার।",
  },
  {
    name: "Demolition & Breaking Labour",
    name_bn: "ভাঙার লেবার (বিল্ডিং ও দেওয়াল)",
    slug: "demolition-labour",
    icon: "🔨",
    description: "পুরাতন ছাদ, ওয়াল বা স্ট্রাকচার ভাঙা এবং রাবিশ বা ধ্বংসাবশেষ অপসারণ কর্মী।",
  },
  {
    name: "Rickshaw & Easybike Mechanic",
    name_bn: "রিকশা ও ইজিবাইক মেকানিক",
    slug: "rickshaw-mechanic",
    icon: "🛺",
    description: "ব্যাটারিচালিত রিকশা, ইজিবাইক মেরামত, মোটর ওয়্যারিং ও চাকা ব্যালেন্সিং কারিগর।",
  },
  {
    name: "Refrigerator Technician",
    name_bn: "ফ্রিজ মেকানিক ও টেকনিশিয়ান",
    slug: "refrigerator-technician",
    icon: "🧊",
    description: "ডিপ ও নরমাল ফ্রিজের গ্যাস চার্জিং, কমপ্রেসর মেরামত ও কুলিং সমস্যা সমাধান।",
  },
  {
    name: "Washing Machine & Oven",
    name_bn: "ওয়াশিং মেশিন ও ওভেন মিস্ত্রি",
    slug: "washing-machine-technician",
    icon: "🧺",
    description: "অটোমেটিক ওয়াশিং মেশিন, মাইক্রোওয়েভ ওভেন সার্কিট ও মোটর মেরামতের টেকনিশিয়ান।",
  },
  {
    name: "IPS, UPS & Inverter",
    name_bn: "আইপিএস ও ব্যাটারি টেকনিশিয়ান",
    slug: "ips-technician",
    icon: "🔋",
    description: "হোম আইপিএস সেটআপ, ইনভার্টার মেরামত ও ব্যাটারি এসিড/পানি মেইনটেন্যান্স।",
  },
  {
    name: "Water Purifier Technician",
    name_bn: "ওয়াটার পিউরিফায়ার ও ফিল্টার",
    slug: "water-purifier-technician",
    icon: "💧",
    description: "আরও (RO) ফিল্টার ইনস্টলেশন, ক্যান্ডেল চেঞ্জ, মেমব্রেন ও মোটর সার্ভিসিং।",
  },
  {
    name: "Locksmith / Key Maker",
    name_bn: "তালা-চাবি মিস্ত্রি (লকস্মিথ)",
    slug: "locksmith",
    icon: "🔑",
    description: "লক ডুপ্লিকেট চাবি তৈরি, ডিজিটাল বা মাস্টার লক খোলা ও ড্রয়ার/ডোর লক মেরামত।",
  },
  {
    name: "Rod Binder Mistri",
    name_bn: "রড বাইন্ডার (রড মিস্ত্রি)",
    slug: "rod-binder",
    icon: "🏗️",
    description: "বিল্ডিং ও ছাদ ঢালাইয়ের রড কাটিং, বেন্ডিং ও সুনির্দিষ্ট নকশায় বাইন্ডিং কারিগর।",
  },
  {
    name: "Shuttering & Scaffolding",
    name_bn: "সাটারিং ও সেন্টারিং মিস্ত্রি",
    slug: "shuttering-mistri",
    icon: "🪵",
    description: "ছাদ ও বিমের কাঠের তক্তা, স্টিল সাটারিং এবং বাঁশ-পাইপ স্ক্যাফোল্ডিং তৈরির মিস্ত্রি।",
  },
  {
    name: "Motorcycle & Scooter Mechanic",
    name_bn: "মোটরসাইকেল মেকানিক",
    slug: "motorcycle-mechanic",
    icon: "🏍️",
    description: "বাইক ও স্কুটারের ইঞ্জিন টিউনিং, সার্ভিসিং, ব্রেক ও ইলেকট্রিক্যাল ওয়্যারিং মেকানিক।",
  },
  {
    name: "Pest Control Specialist",
    name_bn: "পেস্ট কন্ট্রোল (পোকামাকড় দমন)",
    slug: "pest-control",
    icon: "🐜",
    description: "ছারপোকা, তেলাপোকা, উইপোকা ও ইঁদুর দমনে নিরাপদ স্প্রে ও মেডিসিন বিশেষজ্ঞ।",
  },
  {
    name: "Sofa & Carpet Cleaner",
    name_bn: "সোফা ও কার্পেট ওয়াশ কর্মী",
    slug: "sofa-carpet-cleaner",
    icon: "🛋️",
    description: "ফেব্রিক সোফা, কার্পেট, অফিস চেয়ার ও ম্যাট্রেস ফোম ওয়াশ ও ড্রাই ক্লিনিং।",
  },
  {
    name: "Septic Tank Cleaner",
    name_bn: "সেপটিক ট্যাংক ও ড্রেন ক্লিনার",
    slug: "septic-cleaner",
    icon: "🕳️",
    description: "সেপটিক ট্যাংক খালি করা, জাম্প হওয়া ড্রেন পাইপ পরিষ্কার ও সাকশন পাম্প সেবা।",
  },
  {
    name: "Gardener & Tree Cutter",
    name_bn: "মালী ও বাগান পরিচর্যাকর্মী",
    slug: "gardener",
    icon: "🌿",
    description: "ছাদবাগান তৈরি, গাছ কাটিং ও ছাঁটাই, ঘাস পরিষ্কার ও সার-কীটনাশক প্রয়োগের মালী।",
  },
];

const locations = [
  {
    name: "Dhaka",
    name_bn: "ঢাকা",
    slug: "dhaka",
    division: "Dhaka",
    description: "Capital Division & Metropolitan Area",
  },
  {
    name: "Chittagong",
    name_bn: "চট্টগ্রাম",
    slug: "chittagong",
    division: "Chittagong",
    description: "Chittagong Division & Coastal Belt",
  },
  {
    name: "Mymensingh",
    name_bn: "ময়মনসিংহ",
    slug: "mymensingh",
    division: "Mymensingh",
    description: "Mymensingh Division & Districts",
  },
  {
    name: "Sylhet",
    name_bn: "সিলেট",
    slug: "sylhet",
    division: "Sylhet",
    description: "Sylhet Division & Surrounding Districts",
  },
  {
    name: "Rajshahi",
    name_bn: "রাজশাহী",
    slug: "rajshahi",
    division: "Rajshahi",
    description: "Rajshahi Division & Northern Region",
  },
  {
    name: "Khulna",
    name_bn: "খুলনা",
    slug: "khulna",
    division: "Khulna",
    description: "Khulna Division & Southwestern Region",
  },
];

const initialWorkers = [
  {
    full_name: "Abul Kashem Mistri",
    phone: "01711112233",
    slug: "abul-kashem-mistri-1001",
    service_type: "Electrician",
    city: "Dhaka",
    experience: "5-10 Years",
    details: "Expert house electrician for wiring, DB box setup, and emergency fault fixing across Dhaka.",
    status: "APPROVED",
    is_verified: true,
    rating: 4.9,
    review_count: 12,
  },
  {
    full_name: "Mohammad Ali Plumber",
    phone: "01822223344",
    slug: "mohammad-ali-plumber-1002",
    service_type: "Plumber",
    city: "Chittagong",
    experience: "10+ Years",
    details: "Sanitary fitting specialist, water pump installation, and concealed pipe repair expert.",
    status: "APPROVED",
    is_verified: true,
    rating: 4.8,
    review_count: 8,
  },
  {
    full_name: "Rahim Master Rajmistri",
    phone: "01933334455",
    slug: "rahim-master-rajmistri-1003",
    service_type: "Rajmistri",
    city: "Mymensingh",
    experience: "10+ Years",
    details: "Experienced building contractor, brickwork specialist, and residential civil construction master.",
    status: "APPROVED",
    is_verified: true,
    rating: 5.0,
    review_count: 15,
  },
];

async function main() {
  console.log("🌱 Starting Sromojibi Database Seeding...");

  // Seed Categories
  console.log("📦 Seeding Worker Categories...");
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        name_bn: cat.name_bn,
        icon: cat.icon,
        description: cat.description,
        is_active: true,
      },
      create: {
        name: cat.name,
        name_bn: cat.name_bn,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        is_active: true,
      },
    });
  }

  // Seed Sample Approved Workers
  console.log("👷 Seeding Initial Verified Worker Profiles...");
  for (const w of initialWorkers) {
    const categoryObj = await prisma.category.findUnique({
      where: { slug: w.service_type.toLowerCase().replace(/\s+/g, "-") },
    });

    const expNum = parseInt(w.experience.replace(/[^0-9]/g, "")) || 5;

    // Find matching division
    const div = await prisma.division.findFirst({
      where: {
        OR: [
          { title_en: { contains: w.city, mode: "insensitive" } },
          { title_bn: { contains: w.city, mode: "insensitive" } },
        ],
      },
    });

    const upsertedWorker = await prisma.workerProfile.upsert({
      where: { slug: w.slug },
      update: {
        full_name: w.full_name,
        phone: w.phone,
        experience: expNum,
        details: w.details,
        status: w.status as any,
        is_verified: w.is_verified,
        rating: w.rating,
        review_count: w.review_count,
        fk_division_id: div?.id || null,
      },
      create: {
        full_name: w.full_name,
        phone: w.phone,
        slug: w.slug,
        experience: expNum,
        details: w.details,
        status: w.status as any,
        is_verified: w.is_verified,
        rating: w.rating,
        review_count: w.review_count,
        fk_division_id: div?.id || null,
      },
    });

    if (categoryObj) {
      await prisma.workerCategory.upsert({
        where: {
          fk_worker_id_fk_category_id: {
            fk_worker_id: upsertedWorker.id,
            fk_category_id: categoryObj.id,
          },
        },
        update: {},
        create: {
          fk_worker_id: upsertedWorker.id,
          fk_category_id: categoryObj.id,
        },
      });
    }
  }

  console.log("✅ Database Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
