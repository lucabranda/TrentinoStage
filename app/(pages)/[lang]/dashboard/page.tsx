import DashboardLayout from "@/components/Layout/DashboardLayout";
import styles from "./page.module.css";
import { getMessages } from "@/utils/systemMessage";

import { getProfileInfo, isProfileOwner } from '@/utils/profiles';
import { getProfileId, isCompany, getAccountInfo } from '@/utils/accounts';
import {isLoggedIn, checkSessionToken } from '@/utils/session';
import { cookies } from 'next/headers';

import {SessionApi} from '@/api/sessionApi';
import {ProfilesApi} from '@/api/profilesApi';
import { AccountsApi } from "@/api/accountsApi";

import { redirect } from 'next/navigation';
import { removeSessionToken } from "@/utils/cookie";
import NewProfileForm from "@/components/forms/NewProfileForm";

const logout = () => {
  removeSessionToken();
  redirect("/");
}

export default async function Home({ params }: any) {
  const messages = await getMessages((await params).lang);
  
  if(!(await isLoggedIn()))
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
  const isACompany = _isACompany.body.isCompany || false;

  var profileData;

  if(profileId){
    var _profileData = await profilesApi.apiProfilesGetGet(sessionToken, profileId);
    profileData = _profileData.body;
  } 

  return(
    <>
    { 
      !profileId ?
        <NewProfileForm messages={messages} styles={styles} isCompany={isACompany} />
        :
        <DashboardLayout
          params={(await params)}
          styles={styles}
          messages={messages}
          profileData={profileData}
          isACompany={isACompany}
          profileId={profileId}
        />
    }
    </>
  )
}
