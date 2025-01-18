import DashboardLayout from "@/components/Layout/DashboardLayout";
import styles from "./page.module.css";
import { getMessages } from "@/utils/systemMessage";

import { getProfileInfo, isProfileOwner } from '@/utils/profiles';
import { getProfileId, isCompany, getAccountInfo } from '@/utils/accounts';
import {isLoggedIn, checkSessionToken } from '@/utils/session';
import { cookies } from 'next/headers';

import { redirect } from 'next/navigation';
import { removeSessionToken } from "@/utils/cookie";

const logout = () => {
  removeSessionToken();
  redirect("/");
}

export default async function Home({ params }: any) {
  const messages = await getMessages((await params).lang);
  
  if(!(await isLoggedIn()))
    redirect(`/login`);

  const cookieStore = await cookies();
  const sessionToken = await cookieStore.get('trentino-stage-session')?.value || "";

  // get account id
  const accountId = await checkSessionToken(sessionToken);

  const profileId = await getProfileId(accountId);
  const isACompany = await isCompany(accountId);
  const data = await getAccountInfo(accountId);

  if(!isProfileOwner(profileId, accountId))
    redirect(`/${(await params).lang}/create-profile`);
  
  const profileData = await getProfileInfo(profileId);

  return(
    <DashboardLayout
      params={(await params)}
      styles={styles}
      messages={messages}
      profileData={profileData}
      isACompany={isACompany}
      profileId={profileId}
      
    />
  )
}
