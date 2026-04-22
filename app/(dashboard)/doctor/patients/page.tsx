import { getDoctorPatients } from "@/actions/patients";
import PatientsClient from "./PatientsClient";

export default async function MyPatients() {
    // Fetch ALL real database patients assigned to this doctor natively!
    const ALL_PATIENTS = await getDoctorPatients();

    return <PatientsClient initialPatients={ALL_PATIENTS} />;
}
