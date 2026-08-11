import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import fs from "fs";
import path from "path";

const connectionString = process.env.DATABASE_URL || "";
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

export async function seedBDAddress() {
  console.log("🚀 Starting Bulk BD Address Seeding...");
  const startTime = Date.now();

  const dataPath = path.join(process.cwd(), "data", "bd", "division.json");
  const rawData = fs.readFileSync(dataPath, "utf-8");
  const divisions = JSON.parse(rawData);

  const divisionBatch: any[] = [];
  const districtBatch: any[] = [];
  const upazilaBatch: any[] = [];
  const unionBatch: any[] = [];

  for (const div of divisions) {
    divisionBatch.push({
      id: div._id,
      bbs_code: div.bbs_code ?? null,
      title: div.title || "",
      title_bn: div.title_bn || null,
      title_en: div.title_en || null,
      row_status: div.row_status ?? 1,
    });

    for (const zilla of div.zilla || []) {
      districtBatch.push({
        id: zilla._id,
        bbs_code: zilla.bbs_code ?? null,
        loc_division_id: div._id,
        title: zilla.title || "",
        title_bn: zilla.title_bn || null,
        title_en: zilla.title_en || null,
        url: zilla.url || null,
        row_status: zilla.row_status ?? 1,
      });

      for (const upz of zilla.upzilla || []) {
        upazilaBatch.push({
          id: upz._id,
          bbs_code: upz.bbs_code ? String(upz.bbs_code) : null,
          loc_district_id: zilla._id,
          loc_division_id: div._id,
          title_bn: upz.title_bn || null,
          title_en: upz.title_en || null,
          url: upz.url || null,
          row_status: upz.row_status ?? 1,
        });

        for (const u of upz.union || []) {
          unionBatch.push({
            id: u._id,
            bbs_code: u.bbs_code ? String(u.bbs_code) : null,
            loc_district_id: zilla._id,
            loc_division_id: div._id,
            loc_upazila_id: upz._id,
            title_bn: u.title_bn || null,
            title_en: u.title_en || null,
            row_status: u.row_status ?? 1,
          });
        }
      }
    }
  }

  console.log(`Prepared Bulk Data:`);
  console.log(`- Divisions: ${divisionBatch.length}`);
  console.log(`- Districts: ${districtBatch.length}`);
  console.log(`- Upazilas: ${upazilaBatch.length}`);
  console.log(`- Unions: ${unionBatch.length}`);

  // 1. Insert Divisions
  console.log("Seeding Divisions...");
  await prisma.division.createMany({
    data: divisionBatch,
    skipDuplicates: true,
  });

  // 2. Insert Districts
  console.log("Seeding Districts...");
  await prisma.district.createMany({
    data: districtBatch,
    skipDuplicates: true,
  });

  // 3. Insert Upazilas
  console.log("Seeding Upazilas...");
  await prisma.upazila.createMany({
    data: upazilaBatch,
    skipDuplicates: true,
  });

  // 4. Insert Unions in chunks of 1000
  console.log("Seeding Unions in chunks...");
  const chunkSize = 1000;
  for (let i = 0; i < unionBatch.length; i += chunkSize) {
    const chunk = unionBatch.slice(i, i + chunkSize);
    await prisma.union.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    console.log(`  Seeded ${Math.min(i + chunkSize, unionBatch.length)} / ${unionBatch.length} unions...`);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Bulk Seeding Completed in ${duration}s!`);
}

seedBDAddress()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
