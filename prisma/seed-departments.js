const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DEPARTMENTS = [
    "Cardiology",
    "Emergency",
    "Cardiac Surgery",
    "Echocardiography",
    "Dental Section",
    "Pharmacy",
    "Pathology",
    "Anesthetics",
    "Breast Screening",
    "Ear, Nose & Throat",
    "Elderly Service",
    "Gastroenterology",
    "General Surgery",
    "Gynecology",
    "Hematology",
    "Neonatal Unit",
    "Neurology",
    "Nutrition And Dietetics",
    "Obstetrics and Gynecology",
    "Oncology",
    "Ophthalmology",
    "Orthopedics",
    "Physiotherapy",
    "Renal Unit",
    "Sexual Health",
    "Urology",
    "Dentist",
    "Pediatric",
    "Medical Science",
    "Endocrinology",
    "Psychiatry",
    "Allergology",
    "Infectiology",
    "Surgical",
    "Intensive Care Unit",
    "Accident and Emergency",
    "Burn Center",
    "Central Sterile Service",
    "Chaplaincy",
    "Coronary Care Unit",
    "Critical Care",
    "Diagnosing Imaging",
    "Discharge Lounge",
    "Health and Safety",
    "Maternity",
    "Medical Records",
    "Microbiology",
    "Nephrology",
    "Occupational Therapy",
    "Pain Management",
    "Radiology",
    "Radiotherapy",
    "Rheumatology",
    "Infection Control",
    "Paediatrics",
    "Outpatient",
    "Inpatient",
    "Housekeeping",
    "Social Work",
    "Medical Maintenance",
    "Human Resources",
    "Finance",
    "Administration",
    "Anatomy",
    "Community Medicine",
    "Forensic Medicine",
    "Pharmacology",
    "Health Surgical",
    "Plastic Surgery",
    "Modern Burn Unit",
    "Neurosurgery",
    "Dengue Isolation",
    "Dermatology",
    "General Physician"
];

async function main() {
    console.log("🏥 Seeding departments...\n");

    let created = 0;
    let skipped = 0;

    for (const name of DEPARTMENTS) {
        const existing = await prisma.department.findFirst({ where: { name } });
        if (existing) {
            console.log(`  ⏭  Already exists: ${name}`);
            skipped++;
        } else {
            await prisma.department.create({
                data: {
                    name,
                    description: `${name} department`,
                    isActive: true
                }
            });
            console.log(`  ✅ Created: ${name}`);
            created++;
        }
    }

    console.log(`\n✨ Done! Created ${created} departments, skipped ${skipped} existing.`);
}

main()
    .catch(e => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
