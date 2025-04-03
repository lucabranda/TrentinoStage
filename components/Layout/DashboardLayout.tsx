"use client";
import { useState } from 'react';
import Image from 'next/image';
import logo from "@/public/logo.svg";
import { Button, Layout, Menu } from "antd";
import { Header, Content, Footer, Sider } from "@/components/Layout/Layout";
import { HomeOutlined, MenuOutlined, LogoutOutlined, BuildOutlined, PaperClipOutlined, SearchOutlined, UserOutlined, SettingOutlined, CloseOutlined, TeamOutlined} from "@ant-design/icons";
import { Link } from "@/components/Typography";
import LanguageSelector from "@/components/buttons/LanguageSelector";
import CompanyCard from "../dashboard/CompanyCard";
import UserCard from "../dashboard/UserCard";
import { OfferSectionCompany, OfferSectionUser } from "../dashboard/OfferSection";
import { ApplicationSectionCompany, ApplicationSectionUser } from "../dashboard/ApplicationSection";
import {removeSessionToken} from "@/utils/cookie";
import InviteMembers from "@/components/dashboard/InviteMembers";


interface DashboardLayoutProps {
  params: any;
  messages: any;
  token: string;
  isACompany: boolean;
  profileId: string;
  styles: any;
  name: string;
  surname: string;
  address: string;
  birthDate: string;
  bio: string;
  sector: string;
  website: string; 
}

enum TabKeys {
  ProfileInfo = "profileInfo",
  Offers = "offers",
  Applications = "applications",
  Logout = "logout",
  InviteMembers = "inviteMembers",
}


export default function DashboardLayout({ params, messages, token, isACompany, profileId, styles, name, surname, address, birthDate, bio, sector, website }: DashboardLayoutProps) {

  const [collapsed, setCollapsed] = useState(false);
  const [activeKey, setActiveKey] = useState<TabKeys>(TabKeys.ProfileInfo);


  function logout() {
    removeSessionToken();
    window.location.href = "/";
  }

  // Sidebar links
  const itemsSidebar = [
    {
      key: TabKeys.ProfileInfo,
      icon: isACompany ? <BuildOutlined /> : <UserOutlined />,
      url: `/${( params).lang}/dashboard`,
      label: isACompany ? messages["dashboard-company-profile"] : messages["dashboard-user-profile"],
    },
    {
      key: TabKeys.Offers,
      icon: <SearchOutlined/>,
      label: messages["dashboard-offers"],
      url: `/${( params).lang}/dashboard#offers`,
    },
    {
      key: TabKeys.Applications,
      icon: <PaperClipOutlined/>,
      label: messages["dashboard-applications"],
      url: `/${( params).lang}/dashboard#applications`
    }
  ];

  if(isACompany){
      itemsSidebar.push({
          key: TabKeys.InviteMembers,
          icon: <TeamOutlined />,
          label: messages["dashboard-invite-members"],
          url: `/${( params).lang}/dashboard#searchpeople`,
      });
  }

  // Should be kept last
  itemsSidebar.push({
    key: TabKeys.Logout,
    icon: <a href="#" onClick={() => logout()}><LogoutOutlined/></a>,
    label: <Link href="#" onClick={() => logout()}>{messages["dashboard-logout"]}</Link>,
    url: "#"
  });

  return (
    <>
      <Layout className={styles.layout}>
        <Sider
          width="15%"
          className={styles.sider}
          collapsible
          trigger={null}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(!collapsed)}
        >
          <div className={styles.closeButton} style={{ alignContent: collapsed ? "right" : "left" }}>
            <Button onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <MenuOutlined /> : <CloseOutlined />}
            </Button>
          </div>
          <Menu
            mode="vertical"
            items={itemsSidebar}
            className={styles.menu}
            selectedKeys={[activeKey]}
            onSelect={(e: any) => setActiveKey(e.key)}
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
              {activeKey === TabKeys.ProfileInfo && (
                <section key="profile">
                    <h1 className={styles.title}>{messages["dashboard-hi"]} {name}</h1>
                    <p className={styles.description}>
                      {messages["dashboard-description"]}
                    </p>
                    {isACompany ? (
                      <CompanyCard session={token} id={profileId} messages={messages} profileData={{name, address, sector, website}}/*profileData={profile}*//>
                    ) : (
                      <UserCard session={token} id={profileId} messages={messages} profileData={{name, surname, address, birthDate, bio, sector}}/*profileData={profile}*//>
                    )}
                </section>
              )}
              {activeKey === TabKeys.Offers && (
                <section key="offers">
                  {isACompany ? (
                    <OfferSectionCompany session={token} id={profileId} messages={messages} />
                  ) : (
                    <OfferSectionUser session={token} id={profileId} messages={messages} />
                  )}
                </section>
              )}
              {activeKey === TabKeys.Applications && (
                <section key="applications">
                  {isACompany ? (
                    <ApplicationSectionCompany session={token} id={profileId} messages={messages} />
                  ) : (
                    <ApplicationSectionUser session={token} id={profileId} messages={messages} />
                  )}
                </section>
              )}
              {activeKey === TabKeys.InviteMembers && isACompany && (
                <section key="searchpeople">
                  <InviteMembers session={token} id={profileId} messages={messages} styles={styles} />
                </section>
              )}
            </main>
          </Content>
          <div className={styles.mobileMenu}>

            <Menu
              mode="horizontal"
              items={itemsSidebar.map((item) => ({ ...item, label: "" }))}
              className={styles.menu}
              selectedKeys={[activeKey]}
              onSelect={(e: any) => setActiveKey(e.key)}
            />
          </div>
        </Layout>
      </Layout>
    </>
  );
}
