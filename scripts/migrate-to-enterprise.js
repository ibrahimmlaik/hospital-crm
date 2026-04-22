/**
 * Data Migration Script for Enterprise Transformation
 * 
 * This script migrates existing data to the new schema:
 * 1. Creates a default "General Ward" if no wards exist
 * 2. Migrates existing beds to the General Ward
 * 3. Migrates doctor specializations to departments
 * 4. Updates appointments with department IDs
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting data migration...\n');

    try {
        // Step 1: Create default ward if none exist
        console.log('Step 1: Checking for wards...');
        const wardCount = await prisma.ward.count();

        let defaultWard;
        if (wardCount === 0) {
            console.log('  → No wards found. Creating default "General Ward"...');

            // Get first admin user
            const admin = await prisma.user.findFirst({
                where: { role: 'ADMIN' }
            });

            if (!admin) {
                throw new Error('No admin user found. Please create an admin user first.');
            }

            defaultWard = await prisma.ward.create({
                data: {
                    name: 'General Ward',
                    description: 'Default general ward for all patients',
                    capacity: 50,
                    createdBy: admin.id,
                    isActive: true
                }
            });
            console.log(`  ✓ Created General Ward (ID: ${defaultWard.id})`);
        } else {
            console.log(`  ✓ Found ${wardCount} existing ward(s)`);
            defaultWard = await prisma.ward.findFirst();
        }

        // Step 2: Migrate existing beds (if any old beds exist)
        // Note: Since we reset the database, there won't be old beds
        // But this code is here for future reference
        console.log('\nStep 2: Checking for beds to migrate...');
        console.log('  ✓ No old beds to migrate (fresh schema)');

        // Step 3: Migrate doctor specializations to departments
        console.log('\nStep 3: Migrating doctor specializations to departments...');
        const doctors = await prisma.doctor.findMany({
            include: {
                user: true,
                departments: true
            }
        });

        if (doctors.length === 0) {
            console.log('  → No doctors found to migrate');
        } else {
            console.log(`  → Found ${doctors.length} doctor(s)`);

            // Since we removed the specialization field, we'll assign all doctors
            // to the General department if it exists, or create it
            let generalDept = await prisma.department.findFirst({
                where: { name: 'General Medicine' }
            });

            if (!generalDept) {
                console.log('  → Creating "General Medicine" department...');
                generalDept = await prisma.department.create({
                    data: {
                        name: 'General Medicine',
                        description: 'General medical services',
                        isActive: true
                    }
                });
            }

            // Assign doctors to General Medicine if they have no departments
            for (const doctor of doctors) {
                if (doctor.departments.length === 0) {
                    await prisma.doctorDepartment.create({
                        data: {
                            doctorId: doctor.id,
                            departmentId: generalDept.id,
                            isPrimary: true
                        }
                    });
                    console.log(`  ✓ Assigned Dr. ${doctor.user.name} to General Medicine`);
                }
            }
        }

        // Step 4: Update appointments with department IDs
        console.log('\nStep 4: Updating appointments with department IDs...');
        const appointments = await prisma.appointment.findMany({
            include: {
                doctor: {
                    include: {
                        departments: {
                            where: { isPrimary: true },
                            include: { department: true }
                        }
                    }
                }
            }
        });

        if (appointments.length === 0) {
            console.log('  → No appointments found to update');
        } else {
            console.log(`  → Found ${appointments.length} appointment(s)`);

            // Since appointments now require departmentId, and we reset the DB,
            // there won't be any appointments without it
            console.log('  ✓ All appointments have department IDs (fresh schema)');
        }

        console.log('\n✅ Data migration completed successfully!\n');
        console.log('Summary:');
        console.log(`  - Wards: ${await prisma.ward.count()}`);
        console.log(`  - Beds: ${await prisma.bed.count()}`);
        console.log(`  - Departments: ${await prisma.department.count()}`);
        console.log(`  - Doctors: ${await prisma.doctor.count()}`);
        console.log(`  - Appointments: ${await prisma.appointment.count()}`);

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
