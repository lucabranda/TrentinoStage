import {getMessages} from "@/utils/systemMessage";
import {cookies} from "next/headers";
import {isLoggedIn} from "@/utils/session";
import {redirect} from "next/navigation";
import ViewProfileCard from "@/components/dashboard/ViewProfileCard"; 
        
export default async function ProfileCardView({params}: any) {
    if (!(await isLoggedIn()))
        redirect(`/login`);

    const msgs = await getMessages((await params).lang);
    const profile_id = (await params).profile_id;
    const cookieStore = await cookies();
    const token = await cookieStore.get('trentino-stage-session')?.value || "";

    const response = await fetch(`/api/profiles/isCompany?token=${token}&profileId=${profile_id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Errore nella richiesta: ${response.statusText}`);
    }

    const data = await response.json();
    const isACompany = data.isCompany || false;

    return (
        <>
            <ViewProfileCard
                token={token}
                profile_id={profile_id}
                messages={msgs}
                isCompany={isACompany}
            />

        </>
    )
}

// 6787f12196676160cc2d8555   AZIENDA
//