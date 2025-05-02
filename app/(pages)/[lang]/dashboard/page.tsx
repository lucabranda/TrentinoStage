import DashboardLayout from "@/components/Layout/DashboardLayout";
import styles from "./page.module.css";
import {getMessages} from "@/utils/systemMessage";

import {redirect} from 'next/navigation';
import NewProfileForm from "@/components/forms/NewProfileForm";
import {cookies} from 'next/headers';

export default async function Home({params}: any) {
    const messages = await getMessages((await params).lang);

    const cookieStore = await cookies();
    const sessionToken = await cookieStore.get('trentino-stage-session')?.value || "";

    const baseUrl = process.env.BASE_PATH || "http://localhost:3000";

    // Verifica sessione
    const sessionResponse = await fetch(`${baseUrl}/api/session?token=${encodeURIComponent(sessionToken)}`, {
        method: "GET",
    });

    if (!sessionResponse.ok) {
        redirect(`/login`);
    }

    // Ottieni dati account
    const accountResponse = await fetch(`${baseUrl}/api/accounts?token=${encodeURIComponent(sessionToken)}`, {
        method: "GET",
    });

    if (!accountResponse.ok) {
        throw new Error("Errore nel recupero dei dati dell'account");
    }

    const accountData = await accountResponse.json();
    const { profileId, role } = accountData;

    // Verifica se è un'azienda
    const isACompany = role.includes("company-");

    // Ottieni dati profilo
    const profileResponse = await fetch(`${baseUrl}/api/profiles/get?token=${encodeURIComponent(sessionToken)}&profileId=${encodeURIComponent(profileId)}`, {
        method: "GET",
    });

    if (!profileResponse.ok) {
        if (!profileId && !(role?.includes("company-employee")))
            return (<NewProfileForm token={sessionToken} msgs={messages} styles={styles} isCompany={isACompany}/>);
    }
    const profileData = await profileResponse.json();
    console.log(profileData);
    return (
        <>
            <DashboardLayout
                params={(await params)}
                styles={styles}
                messages={messages}
                token={sessionToken}
                isACompany={isACompany}
                profileId={profileId}
                name={profileData.name}
                surname={profileData.surname}
                address={profileData.address}
                birth_date={profileData.birth_date}
                bio={profileData.bio}
                sector={profileData.sector}
                website={profileData.website}
                identifier={profileData.identifier}
                profile_image={profileData.profile_image}
            />
        </>
    );
}