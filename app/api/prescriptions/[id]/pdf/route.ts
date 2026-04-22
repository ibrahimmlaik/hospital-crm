import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import jsPDF from "jspdf";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: prescriptionId } = await context.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch prescription with all related data
        const prescription = await prisma.prescription.findUnique({
            where: { id: prescriptionId },
            include: {
                patient: {
                    select: {
                        name: true,
                        phone: true,
                        dob: true,
                        gender: true
                    }
                },
                doctor: {
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        if (!prescription) {
            return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
        }

        // Security: Patients can only download their own prescriptions
        if (currentUser.role === "PATIENT") {
            const patient = await prisma.patient.findUnique({
                where: { userId: currentUser.userId }
            });

            if (!patient || patient.id !== prescription.patientId) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        // Generate PDF
        const doc = new jsPDF();

        // Hospital Header
        doc.setFillColor(15, 23, 42); // Dark blue
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", 'bold');
        doc.text("Nexus Health CRM", 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont("helvetica", 'normal');
        doc.text("Digital Prescription", 105, 28, { align: 'center' });
        doc.text("Issue e-prescriptions directly to pharmacy", 105, 34, { align: 'center' });

        // Reset text color for body
        doc.setTextColor(0, 0, 0);

        // Prescription Details
        doc.setFontSize(16);
        doc.setFont("helvetica", 'bold');
        doc.text("Prescription Details", 20, 55);

        doc.setFontSize(10);
        doc.setFont("helvetica", 'normal');

        // Date
        const date = new Date(prescription.createdAt);
        doc.text(`Date: ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 65);
        doc.text(`Prescription ID: ${prescription.id}`, 20, 72);

        // Patient Information
        doc.setFontSize(12);
        doc.setFont("helvetica", 'bold');
        doc.text("Patient Information", 20, 85);

        doc.setFontSize(10);
        doc.setFont("helvetica", 'normal');
        doc.text(`Name: ${prescription.patient.name}`, 20, 93);
        doc.text(`Gender: ${prescription.patient.gender}`, 20, 100);
        doc.text(`Phone: ${prescription.patient.phone}`, 20, 107);
        const age = Math.floor((new Date().getTime() - new Date(prescription.patient.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        doc.text(`Age: ${age} years`, 20, 114);

        // Doctor Information
        doc.setFontSize(12);
        doc.setFont("helvetica", 'bold');
        doc.text("Prescribed By", 20, 127);

        doc.setFontSize(10);
        doc.setFont("helvetica", 'normal');
        doc.text(`Dr. ${prescription.doctor.user.name}`, 20, 135);

        // Medicines
        doc.setFontSize(12);
        doc.setFont("helvetica", 'bold');
        doc.text("Medications", 20, 155);

        const medicines = JSON.parse(prescription.medicines);
        let yPos = 165;

        medicines.forEach((med: any, index: number) => {
            doc.setFontSize(10);
            doc.setFont("helvetica", 'bold');
            doc.text(`${index + 1}. ${med.name}`, 20, yPos);

            doc.setFont("helvetica", 'normal');
            doc.text(`   Dosage: ${med.dosage}`, 20, yPos + 6);
            doc.text(`   Frequency: ${med.frequency}`, 20, yPos + 12);
            doc.text(`   Duration: ${med.duration}`, 20, yPos + 18);

            yPos += 28;
        });

        // Clinical Notes
        if (prescription.notes) {
            doc.setFontSize(12);
            doc.setFont("helvetica", 'bold');
            doc.text("Clinical Notes", 20, yPos + 5);

            doc.setFontSize(10);
            doc.setFont("helvetica", 'normal');
            const splitNotes = doc.splitTextToSize(prescription.notes, 170);
            doc.text(splitNotes, 20, yPos + 13);
            yPos += 13 + (splitNotes.length * 5);
        }

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("This is a computer-generated prescription and does not require a signature.", 105, 280, { align: 'center' });
        doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });

        // Generate PDF buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        // Return PDF as downloadable file
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="prescription-${prescription.id}.pdf"`,
            },
        });

    } catch (error) {
        console.error("Error generating PDF:", error);
        return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
    }
}
