"use client";
import { useState } from 'react';
import Image from 'next/image';
import logo from "@/public/logo.svg";
import { Button, Layout, Menu } from "antd";
import { Header, Content, Footer, Sider } from "@/components/Layout/Layout";
import { HomeOutlined, MenuOutlined, LogoutOutlined, BuildOutlined, PaperClipOutlined, SearchOutlined, UserOutlined, SettingOutlined, RightOutlined} from "@ant-design/icons";
import { Link } from "@/components/Typography";
import LanguageSelector from "@/components/buttons/LanguageSelector";
import { PrimaryButton } from '../buttons/Buttons';
import CompanyCard from "../dashboard/CompanyCard";
import UserCard from "../dashboard/UserCard";
import { OfferSectionCompany, OfferSectionUser } from "../dashboard/OfferSection";
import { ApplicationSectionCompany, ApplicationSectionUser } from "../dashboard/ApplicationSection";
import NewProfileForm from '../forms/NewProfileForm';


export default function DashboardLayout({ params, messages, profileData, isACompany, profileId, styles }: any) {

  const [collapsed, setCollapsed] = useState(false);
  const [activeKey, setActiveKey] = useState("1");

  // Sidebar links
  const itemsSidebar = [
    {
      key: "1",
      icon: isACompany ? <BuildOutlined /> : <UserOutlined />,
      url: `/${( params).lang}/dashboard`,
      label: isACompany ? messages["dashboard-company-profile"] : messages["dashboard-user-profile"],
    },
    {
      key: "2",
      icon: <SearchOutlined/>,
      label: messages["dashboard-offers"],
      url: `/${( params).lang}/dashboard#offers`,
    },
    { 
      key: "3", 
      icon: <PaperClipOutlined/>, 
      label: messages["dashboard-applications"],
      url: `/${( params).lang}/dashboard#applications`
    },
    {
      key: "4",
      icon: <SettingOutlined />,
      label: messages["dashboard-settings"],
      url: `/${( params).lang}/dashboard#settings`,
    },
    {
      key: "5",
      icon: <LogoutOutlined/>,
      label: <PrimaryButton href={`/${( params).lang}/logout`}>{messages["dashboard-logout"]}</PrimaryButton>, 
    }
  ];

  
  // Section of the dashboard
  const mainComponents = [
    activeKey === "1" && <section key="profile">
      <h1 className={styles.title}>{messages["dashboard-hi"]} {profileData?.name}</h1>
      <p className={styles.description}>
        {messages["dashboard-description"]}
      </p>
     
      {isACompany ? 
        <CompanyCard session={profileData?.token} id={profileId} messages={messages} /> : 
        <UserCard session={profileData?.token} id={profileId} messages={messages} />
      }
       <NewProfileForm messages={messages} styles={styles} isCompany={isACompany}/>
    </section>,
    activeKey === "2" && <section key="offers">
      {isACompany ? 
        <OfferSectionCompany session={profileData?.token} id={profileId} messages={messages} /> : 
        <OfferSectionUser session={profileData?.token} id={profileId} messages={messages} />
      }
      
    </section>,
    activeKey === "3" && <section key="applications">
      {isACompany ? 
        <ApplicationSectionCompany session={profileData?.token} id={profileId} messages={messages} /> : 
        <ApplicationSectionUser session={profileData?.token} id={profileId} messages={messages} />
      }
    </section>,
    activeKey === "4" && <section key="settings"></section>,
    
  ];


  // TODO: If user has not a profile, redirect to create a profile  



  return (
    <>
      <Layout className={styles.layout}>
      <Sider
            width="15%"
            className={styles.sider}
            collapsible
            trigger={null} 
            collapsed={collapsed}
            onCollapse={(collapsed: boolean | ((prevState: boolean) => boolean)) => setCollapsed(collapsed)}
            activeKey={activeKey}
        >
            <div className={styles.closeButton}>
                <Button onClick={() => setCollapsed(!collapsed)}>{collapsed ? <RightOutlined /> : <MenuOutlined />}</Button>
            </div>
            <Menu
              mode="vertical"
              items={itemsSidebar}
              className={styles.menu}
              selectedKeys={[activeKey]}
              onSelect={(e) => setActiveKey(e.key)}
            />
        </Sider>
        <Layout>
          <Header className={styles.header}>
            <Link href="/"> <HomeOutlined /> </Link>
            <Image
              src={logo}
              alt="logo"
              width={120}
              height={50}
              style={{ filter: "invert(1)" }}
            />
            <LanguageSelector />

          </Header>
          <Content className={styles.content}>
            <main className={styles.main}>
              {mainComponents}
            </main>
          </Content>
          
        </Layout>
      </Layout>
    </>
  );  
}
