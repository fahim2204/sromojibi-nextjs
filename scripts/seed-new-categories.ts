import { prisma } from "../lib/prisma";

const newCategories = [
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
];

async function main() {
  console.log("🌱 Adding 10 new categories to database...");

  for (const cat of newCategories) {
    const result = await prisma.category.upsert({
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

    console.log(`✅ Upserted category: ${result.name} (${result.slug})`);
  }

  const count = await prisma.category.count({ where: { is_active: true } });
  console.log(`🎉 Done! Total active categories in database: ${count}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding categories:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
