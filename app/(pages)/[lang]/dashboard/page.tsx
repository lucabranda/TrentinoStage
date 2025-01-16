import { Layout, Menu } from "antd";
import { Header, Content, Footer, Sider } from "@/components/Layout/Layout";
import styles from "./page.module.css";
import { getMessages } from "@/utils/systemMessage";
import { HomeOutlined, MacCommandFilled, MenuOutlined, LogoutOutlined} from "@ant-design/icons";
import { Link } from "@/components/Typography";
import LanguageSelector from "@/components/buttons/LanguageSelector";
import UserCard from "@/components/dashboard/UserCard";
import OffersSection from "@/components/dashboard/CompanyOffers";
import { PrimaryButton } from "@/components/buttons/Buttons";
import {FaHome, FaUser, FaBuilding, FaPaperPlane, FaSearch} from "react-icons/fa";
import CompanyCard from "@/components/dashboard/CompanyCard";
import {isLoggedIn, checkSessionToken} from '@/utils/session';
import {isProfileOwner, getProfileInfo} from '@/utils/profiles'; 
import { getAccountInfo, isCompany, getProfileId } from "@/utils/accounts";
import { redirect } from 'next/navigation';
import SiderDashboard from "@/components/dashboard/SiderDashboard";
import { getSessionToken} from '@/utils/cookie';
import { cookies } from 'next/headers'

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
    console.log("You are not the owner of this profile");
  
  const profileData = await getProfileInfo(profileId);
  
  // Sidebar links
  const itemsSidebar = [
    {
      key: "1",
      icon: isACompany ? <FaBuilding /> : <FaUser />,
      label: isACompany ? messages["dashboard-company-profile"] : messages["dashboard-user-profile"],
      url: `/${(await params).lang}/dashboard`,
    },
    {
      key: "2",
      icon: <FaSearch/>,
      label: messages["dashboard-offers"],
      url: `/${(await params).lang}/dashboard/offers`,
    },
    { 
      key: "3", 
      icon: <FaPaperPlane/>, 
      label: messages["dashboard-applications"],
      url: `/${(await params).lang}/dashboard/applications`},
    {
      key: "4",
      icon: <LogoutOutlined/>,
      label: <><PrimaryButton href="/logout" className={styles.logoutButton}>
      {messages["dashboard-logout"]}
    </PrimaryButton> </>
    }
  ];
  // Section of the dashboard
  const mainComponents = [
    <section key="profile">
      {isACompany ? 
        <CompanyCard session={data?.token} id={profileId} messages={messages} /> : 
        <UserCard session={data?.token} id={profileId} messages={messages} />
      }
    </section>,
    <section key="offers">
      <OffersSection messages={messages} />
    </section>,
    <section key="settings"></section>,
    <section key="applications"></section>,
  ];


  // TODO: If user has not a profile, redirect to create a profile  



  return (
    <>
      <Layout className={styles.layout}>
        <SiderDashboard itemsSiderbar={itemsSidebar} styles={styles}/>
        <Layout>
          <Header className={styles.header}>
            <Link href="/"> <HomeOutlined /> </Link>
            <LanguageSelector />
          </Header>
          <Content className={styles.content}>
            <main className={styles.main}>
              <h1 className={styles.title}>{messages["dashboard-hi"]} {data?.name}</h1>
              <p className={styles.description}>
                {messages["dashboard-description"]}
              </p>
              {mainComponents}
            </main>
          </Content>
          <Footer className={styles.footer}></Footer>
        </Layout>
      </Layout>
    </>
  );
}
