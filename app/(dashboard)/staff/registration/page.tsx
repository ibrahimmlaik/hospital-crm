import RegistrationClient from "./RegistrationClient";
import { getDoctorsList } from "@/actions/doctor";

export default async function PatientRegistration() {
    // Fetch real doctors directly from database inside this Server Component
    const doctors = await getDoctorsList();

    return <RegistrationClient doctors={doctors} />;
}
