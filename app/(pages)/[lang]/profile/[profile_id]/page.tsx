import {getMessages} from "@/utils/systemMessage";
import {ProfilesApi} from "@/api/profilesApi";
import {SessionApi} from "@/api/sessionApi";
import {cookies} from "next/headers";
import {isLoggedIn} from "@/utils/session";
import {redirect} from "next/navigation";
import ViewProfileCard from "@/components/dashboard/ViewProfileCard"; 
        
export default async function ProfileCardView({params}: any) {
    if (!(await isLoggedIn()))
        redirect(`/login`);

    const msgs = await getMessages((await params).lang);
    const profile_id = (await params).profile_id;
    const sessionApi = new SessionApi();
    const profilesApi = new ProfilesApi();

    const cookieStore = await cookies();
    const token = await cookieStore.get('trentino-stage-session')?.value || "";

    console.log(token)
    var _accountId = await sessionApi.apiSessionVerifyGet(token);
    const accountId = _accountId.body.profileId;

    var _isACompany = await profilesApi.apiProfilesIsCompanyGet(token, accountId);
    const isACompany = _isACompany.body.isCompany || false;


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