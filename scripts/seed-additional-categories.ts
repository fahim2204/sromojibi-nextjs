import { prisma } from "../lib/prisma";

const additionalCategories = [
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

async function main() {
  console.log("🌱 Adding 16 additional categories to database...");

  for (const cat of additionalCategories) {
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

    console.log(`✅ Upserted: ${result.name} (${result.slug})`);
  }

  const count = await prisma.category.count({ where: { is_active: true } });
  console.log(`🎉 Success! Total active categories in database: ${count}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding additional categories:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
