"use client";
import {useState} from 'react';
import Image from 'next/image';
import logo from "@/public/logo.svg";
import {Layout, Menu} from "antd";
import {Header, Content, Sider} from "@/components/Layout/Layout";
import {
    MenuOutlined,
    LogoutOutlined,
    BuildOutlined,
    PaperClipOutlined,
    SearchOutlined,
    UserOutlined,
    CloseOutlined,
    TeamOutlined
} from "@ant-design/icons";
import {Link} from "@/components/Typography";
import LanguageSelector from "@/components/buttons/LanguageSelector";
import ProfileCard, {ProfileCompanyData, ProfileUserData} from "../dashboard/ProfileCard";
import {OfferSectionCompany, OfferSectionUser} from "../dashboard/OfferSection";
import {ApplicationSectionCompany, ApplicationSectionUser} from "../dashboard/ApplicationSection";
import {removeSessionToken} from "@/utils/cookie";
import InviteMembers from "@/components/dashboard/InviteMembers";
import {PrimaryButton} from "@/components/buttons/Buttons";


interface DashboardLayoutProps {
    params: any;
    messages: any;
    token: string;
    isACompany: boolean;
    profileId: string;
    styles: any;
    name: string;
    surname: string;
    address: {
        address: string;
    }
    birthDate: string;
    bio: string;
    website: string;
    sector: string;
    partitaIva: string;
}

enum TabKeys {
    ProfileInfo = "profileInfo",
    Offers = "offers",
    Applications = "applications",
    Logout = "logout",
    InviteMembers = "inviteMembers",
}

export default function DashboardLayout({
                                            params,
                                            messages,
                                            token,
                                            isACompany,
                                            profileId,
                                            styles,
                                            name,
                                            surname,
                                            address,
                                            birthDate,
                                            bio,
                                            sector,
                                            website,
                                            partitaIva,
                                        }: DashboardLayoutProps) {

    const [collapsed, setCollapsed] = useState(false);
    const [activeKey, setActiveKey] = useState("1");


    function logout() {
        removeSessionToken();
        window.location.href = "/";
    }

    // Sidebar links
    const itemsSidebar = [
        {
            key: TabKeys.ProfileInfo,
            icon: isACompany ? <BuildOutlined/> : <UserOutlined/>,
            url: `/${(params).lang}/dashboard`,
            label: isACompany ? messages["dashboard-company-profile"] : messages["dashboard-user-profile"],
        },
        {
            key: TabKeys.Offers,
            icon: <SearchOutlined/>,
            label: messages["dashboard-offers"],
            url: `/${(params).lang}/dashboard#offers`,
        },
        {
            key: TabKeys.Applications,
            icon: <PaperClipOutlined/>,
            label: messages["dashboard-applications"],
            url: `/${(params).lang}/dashboard#applications`
        }
    ]

    if (isACompany) {
        itemsSidebar.push({
            key: TabKeys.InviteMembers,
            icon: <TeamOutlined/>,
            label: messages["dashboard-invite-members"],
            url: `/${(params).lang}/dashboard#invitemembers`,
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
                <div className={styles.closeButton} style={{alignContent: collapsed ? "right" : "left"}}>
                    <button onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <MenuOutlined/> : <CloseOutlined/>}
                    </button>
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
                    <Link href="/"> <Image
                        src={logo}
                        alt="logo"
                        width={120}
                        height={50}
                        style={{filter: "invert(1)"}}
                    /> </Link>
                   <div className={styles.headerButtonContainer}>
                       <LanguageSelector/>
                       <PrimaryButton onClick={()=>logout()}>
                           {messages["dashboard-logout"]} <LogoutOutlined/>
                       </PrimaryButton>
                   </div>

                        <LanguageSelector/>
                    </Header>
                    <Content className={styles.content}>
                        <main className={styles.main}>
                            {activeKey === TabKeys.ProfileInfo && (
                                <section key="profile">

                                    <ProfileCard
                                        session={token} id={profileId} messages={messages} isOwner={true}
                                        isCompany={isACompany} profileData={(isACompany ? {
                                        name,
                                        address,
                                        sector,
                                        website,
                                        partitaIva
                                    } as ProfileCompanyData : {
                                        name,
                                        surname,
                                        bio,
                                        birthDate,
                                        address,
                                        sector,
                                        website,
                                    }) as ProfileUserData | ProfileCompanyData}/>
                                </section>
                            )}
                            {activeKey === TabKeys.Offers && (
                                <section key="offers">
                                    {isACompany ? (
                                        <OfferSectionCompany session={token} id={profileId} messages={messages}/>
                                    ) : (
                                        <OfferSectionUser session={token} id={profileId} messages={messages}/>
                                    )}
                                </section>
                            )}
                            {activeKey === TabKeys.Applications && (
                                <section key="applications">
                                    {isACompany ? (
                                        <ApplicationSectionCompany session={token} id={profileId} messages={messages}/>
                                    ) : (
                                        <ApplicationSectionUser session={token} id={profileId} messages={messages}/>
                                    )}
                                </section>
                            )}
                            {activeKey === TabKeys.InviteMembers && (
                                <section key="invitemembers">
                                    <InviteMembers session={token} id={profileId} messages={messages}/>
                                </section>
                            )}

                </main>
            </Content>
            <div className={styles.mobileMenu}>

                <Menu
                    mode="horizontal"
                    items={itemsSidebar.map((item) => ({...item, label: ""}))}
                    className={styles.menu}
                    selectedKeys={[activeKey]}
                    onSelect={(e: any) => setActiveKey(e.key)}
                />
            </div>
        </Layout>
        </Layout>
</>
)
    ;
}