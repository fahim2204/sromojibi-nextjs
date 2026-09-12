import { prisma } from "../lib/prisma";

interface CityAreaSeed {
  title_en: string;
  title_bn: string;
  parent_thana?: string;
  postal_code?: string;
}

const DHAKA_CITY_AREAS: CityAreaSeed[] = [
  // 1. North Dhaka (ঢাকা উত্তর)
  {
    title_en: "Mirpur",
    title_bn: "মিরপুর",
    parent_thana: "Mirpur",
    postal_code: "1216",
  },
  {
    title_en: "Pallabi",
    title_bn: "পল্লবী",
    parent_thana: "Pallabi",
    postal_code: "1216",
  },
  {
    title_en: "Uttara",
    title_bn: "উত্তরা",
    parent_thana: "Uttara",
    postal_code: "1230",
  },
  {
    title_en: "Mohammadpur",
    title_bn: "মোহাম্মদপুর",
    parent_thana: "Mohammadpur",
    postal_code: "1207",
  },
  {
    title_en: "Dhanmondi",
    title_bn: "ধানমন্ডি",
    parent_thana: "Dhanmondi",
    postal_code: "1205",
  },
  {
    title_en: "Gulshan",
    title_bn: "গুলশান",
    parent_thana: "Gulshan",
    postal_code: "1212",
  },
  {
    title_en: "Banani",
    title_bn: "বনানী",
    parent_thana: "Banani",
    postal_code: "1213",
  },
  {
    title_en: "Bashundhara & Baridhara",
    title_bn: "বসুন্ধরা ও বারিধারা",
    parent_thana: "Vatara",
    postal_code: "1229",
  },
  {
    title_en: "Badda",
    title_bn: "বাড্ডা",
    parent_thana: "Badda",
    postal_code: "1212",
  },
  {
    title_en: "Rampura & Banasree",
    title_bn: "রামপুরা ও বনশ্রী",
    parent_thana: "Rampura",
    postal_code: "1219",
  },
  {
    title_en: "Tejgaon & Farmgate",
    title_bn: "তেজগাঁও ও ফার্মগেট",
    parent_thana: "Tejgaon",
    postal_code: "1215",
  },
  {
    title_en: "Cantonment & Kafrul",
    title_bn: "সেনানিবাস ও কাফরুল",
    parent_thana: "Cantonment",
    postal_code: "1206",
  },
  {
    title_en: "Khilkhet & Nikunja",
    title_bn: "খিলক্ষেত ও নিকুঞ্জ",
    parent_thana: "Khilkhet",
    postal_code: "1229",
  },
  {
    title_en: "Shyamoli & Kallyanpur",
    title_bn: "শ্যামলী ও কল্যাণপুর",
    parent_thana: "Adabor",
    postal_code: "1207",
  },
  {
    title_en: "Dakshinkhan & Uttarkhan",
    title_bn: "দক্ষিণখান ও উত্তরখান",
    parent_thana: "Dakshinkhan",
    postal_code: "1230",
  },

  // 2. Central & East Dhaka (ঢাকা কেন্দ্র ও পূর্ব)
  {
    title_en: "Motijheel & Dilkusha",
    title_bn: "মতিঝিল ও দিলকুশা",
    parent_thana: "Motijheel",
    postal_code: "1000",
  },
  {
    title_en: "Paltan & Bijoynagar",
    title_bn: "পল্টন ও বিজয়নগর",
    parent_thana: "Paltan",
    postal_code: "1000",
  },
  {
    title_en: "Khilgaon & Basabo",
    title_bn: "খিলগাঁও ও বাসাবো",
    parent_thana: "Khilgaon",
    postal_code: "1219",
  },
  {
    title_en: "Moghbazar & Malibagh",
    title_bn: "মগবাজার ও মালিবাগ",
    parent_thana: "Ramna",
    postal_code: "1217",
  },
  {
    title_en: "Shahbagh & Elephant Road",
    title_bn: "শাহবাগ ও এলিফ্যান্ট রোড",
    parent_thana: "Shahbagh",
    postal_code: "1000",
  },

  // 3. South Dhaka & Old Dhaka (ঢাকা দক্ষিণ ও পুরান ঢাকা)
  {
    title_en: "Old Dhaka (Puran Dhaka)",
    title_bn: "পুরান ঢাকা (চকবাজার/কোতোয়ালী/সদরঘাট)",
    parent_thana: "Kotwali",
    postal_code: "1100",
  },
  {
    title_en: "Lalbagh & Azimpur",
    title_bn: "লালবাগ ও আজিমপুর",
    parent_thana: "Lalbagh",
    postal_code: "1211",
  },
  {
    title_en: "Wari & Gendaria",
    title_bn: "ওয়ারী ও গেন্ডারিয়া",
    parent_thana: "Wari",
    postal_code: "1203",
  },
  {
    title_en: "Jatrabari & Sayedabad",
    title_bn: "যাত্রাবাড়ী ও সায়েদাবাদ",
    parent_thana: "Jatrabari",
    postal_code: "1204",
  },
  {
    title_en: "Hazaribagh & Kamrangirchar",
    title_bn: "হাজারীবাগ ও কামরাঙ্গীরচর",
    parent_thana: "Hazaribagh",
    postal_code: "1209",
  },
  {
    title_en: "Demra & Konapara",
    title_bn: "ডেমরা ও কোনাপাড়া",
    parent_thana: "Demra",
    postal_code: "1360",
  },
];

async function seedDhakaCityAreas() {
  console.log("Starting seed for Dhaka City Areas...");

  const district = await prisma.district.findFirst({
    where: {
      OR: [{ title_en: "Dhaka" }, { title_bn: "ঢাকা" }, { title: "Dhaka" }],
    },
  });

  if (!district) {
    throw new Error("Dhaka District not found in database.");
  }

  const divisionId = district.loc_division_id;
  const districtId = district.id;

  let insertedCount = 0;
  let updatedCount = 0;

  for (const area of DHAKA_CITY_AREAS) {
    const existing = await prisma.cityArea.findFirst({
      where: {
        loc_district_id: districtId,
        OR: [
          { title_en: { equals: area.title_en, mode: "insensitive" } },
          { title_bn: area.title_bn },
        ],
      },
    });

    if (existing) {
      await prisma.cityArea.update({
        where: { id: existing.id },
        data: {
          title_bn: area.title_bn,
          title_en: area.title_en,
          parent_thana: area.parent_thana,
          postal_code: area.postal_code,
          row_status: 1,
        },
      });
      updatedCount++;
    } else {
      await prisma.cityArea.create({
        data: {
          loc_division_id: divisionId,
          loc_district_id: districtId,
          title_bn: area.title_bn,
          title_en: area.title_en,
          parent_thana: area.parent_thana,
          postal_code: area.postal_code,
          row_status: 1,
        },
      });
      insertedCount++;
    }
  }

  console.log(`✅ Finished seeding Dhaka City Areas!`);
  console.log(`- Newly Inserted: ${insertedCount}`);
  console.log(`- Updated: ${updatedCount}`);
  console.log(`- Total Areas in Dhaka: ${insertedCount + updatedCount}`);
}

seedDhakaCityAreas()
  .catch((e) => {
    console.error("❌ Error seeding Dhaka city areas:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
