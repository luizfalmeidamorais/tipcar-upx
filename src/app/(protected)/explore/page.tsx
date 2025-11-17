import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { authCLient } from "@/lib/auth-client";
import prisma from "@/lib/prisma";
import { searchRides } from "./actions";
import ExploreClient from "./ui/ExploreClient";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const user = session?.user ?? "";

    const fd = new FormData();
    fd.set("q", "");
    fd.set("near", "true");

    const initial = await searchRides(fd);

    return <ExploreClient action={searchRides} initial={initial} />;
}
