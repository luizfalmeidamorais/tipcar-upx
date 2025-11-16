import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession()
    if (session) {
        redirect("/")
    }

    return <div className="mx-auto w-full max-w-md">{children}</div>;
}