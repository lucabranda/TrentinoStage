import DashboardLayout from "@/components/Layout/DashboardLayout";
import styles from "./page.module.css";
import {getMessages} from "@/utils/systemMessage";

import {isLoggedIn} from '@/utils/session';
import {cookies} from 'next/headers';

import {SessionApi} from '@/api/sessionApi';
import {ProfilesApi} from '@/api/profilesApi';
import {AccountsApi} from "@/api/accountsApi";

import {redirect} from 'next/navigation';
import NewProfileForm from "@/components/forms/NewProfileForm";

export default async function Home({params}: any) {
    const messages = await getMessages((await params).lang);

    if (!(await isLoggedIn()))
        redirect(`/login`);

    const sessionApi = new SessionApi();
    const profilesApi = new ProfilesApi();
    const accountsApi = new AccountsApi();

    const cookieStore = await cookies();
    const sessionToken = await cookieStore.get('trentino-stage-session')?.value || "";

    // get account id
    var _accountId = await sessionApi.apiSessionVerifyGet(sessionToken);
    const accountId = _accountId.body.profileId;

    var _profileId = await accountsApi.apiAccountsGetProfileIdGet(accountId!);
    const profileId = _profileId.body.profileId;


    var _isACompany = await profilesApi.apiProfilesIsCompanyGet(sessionToken, accountId);
    const isACompany = _isACompany.body.isCompany || (await accountsApi.apiAccountsRoleGet(sessionToken)).body.role?.includes("company-") as boolean;


    if (!profileId && !(await accountsApi.apiAccountsRoleGet(sessionToken)).body.role?.includes("company-employee"))
        return (<NewProfileForm token={sessionToken} msgs={messages} styles={styles} isCompany={isACompany}/>);

    const baseUrl = process.env.BASE_PATH || "http://localhost:3000";

    //var _profileData = await profilesApi.apiProfilesGetGet(sessionToken, profileId as string);
    //var profileData = _profileData.body;
    
    var profileData;
    try {
        const res = await fetch(`${baseUrl}/api/profiles/get?token=${encodeURIComponent(sessionToken)}&profileId=${encodeURIComponent(profileId!)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });        
        if (!res.ok) {
            const errorData = await res.json();
            console.log(errorData);
            throw new Error(errorData.error);
        }

        profileData = await res.json();
    }catch (error) {
        return Promise.reject(error);
    }

    return (
        <>
            <DashboardLayout
                params={(await params)}
                styles={styles}
                messages={messages}
                token={sessionToken}
                isACompany={isACompany}
                profileId={profileId as string}
                name={profileData!.name!}
                surname={profileData!.surname!}
                address={profileData!.address! as {
                    address: string;
                    city: string;
                    region: string;
                    country: string;
                    postal_code: string;
                    street: string;
                }}
                birth_date={profileData!.birth_date!.toString()}
                bio={profileData!.bio!}
                sector={profileData!.sector!}
                website={profileData!.website!}
                partitaIva={profileData!.identifier!}
            />
        </>

    )
}
