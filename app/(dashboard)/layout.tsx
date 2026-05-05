
import { getCurrentUser } from "@/lib/session";
import Sidebar from "@/components/shared/Sidebar";
import TopBar from "@/components/shared/TopBar";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// Cache hospital name for 5 minutes — avoids a DB query on every page navigation
const getCachedHospitalName = unstable_cache(
    async () => {
        try {
            const settings = await prisma.systemSettings.findFirst();
            return settings?.hospitalName ?? "Nexus Health CRM";
        } catch {
            return "Nexus Health CRM";
        }
    },
    ["hospital-name"],
    { revalidate: 300, tags: ["hospital-settings"] }
);

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    // Use cached hospital name — avoids a DB hit on every sidebar navigation
    const hospitalName = await getCachedHospitalName();

    return (
        <div className="flex min-h-screen bg-[#0f172a]">
            <Sidebar currentUser={user} hospitalName={hospitalName} />
            <main className="flex-1 ml-64 flex flex-col min-h-screen relative">
                <TopBar />
                <div className="flex-1 p-8 overflow-y-auto relative z-10">
                    {children}
                </div>

                {/* Background Gradients for Dashboard Area */}
                <div className="fixed top-0 left-64 right-0 h-screen overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[10%] left-[20%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px]" />
                </div>
            </main>
        </div>
    );
}
