import DashboardLayout from "@/components/Layout/DashboardLayout";
import styles from "./page.module.css";
import { getMessages } from "@/utils/systemMessage";

import {isLoggedIn } from '@/utils/session';
import { cookies } from 'next/headers';

import {SessionApi} from '@/api/sessionApi';
import {ProfilesApi} from '@/api/profilesApi';
import { AccountsApi } from "@/api/accountsApi";

import { redirect } from 'next/navigation';
import { removeSessionToken } from "@/utils/cookie";
import NewProfileForm from "@/components/forms/NewProfileForm";

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

  
  if(!profileId) 
    return (<NewProfileForm token={sessionToken}messages={messages} styles={styles} isCompany={isACompany} />);
 
 
  var _profileData = await profilesApi.apiProfilesGetGet(sessionToken, profileId);
  var profileData = _profileData.body;

  return(
   <DashboardLayout
      params={(await params)}
      styles={styles}
      messages={messages}
      token={sessionToken}
      isACompany={isACompany}
      profileId={profileId}
      name={profileData!.name!}
      surname={profileData!.surname!}
      address={profileData!.address!}
      birthDate={profileData!.birthDate!}
      bio={profileData!.bio!}
      sector={profileData!.sector!}
      website={profileData!.website!}
    />
  )
}
