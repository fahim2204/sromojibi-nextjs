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

    await prisma.workerProfile.upsert({
      where: { slug: w.slug },
      update: {
        full_name: w.full_name,
        phone: w.phone,
        service_type: w.service_type,
        city: w.city,
        experience: w.experience,
        details: w.details,
        status: w.status as any,
        is_verified: w.is_verified,
        rating: w.rating,
        review_count: w.review_count,
        fk_category_id: categoryObj?.id ?? null,
      },
      create: {
        full_name: w.full_name,
        phone: w.phone,
        slug: w.slug,
        service_type: w.service_type,
        city: w.city,
        experience: w.experience,
        details: w.details,
        status: w.status as any,
        is_verified: w.is_verified,
        rating: w.rating,
        review_count: w.review_count,
        fk_category_id: categoryObj?.id ?? null,
      },
    });
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
