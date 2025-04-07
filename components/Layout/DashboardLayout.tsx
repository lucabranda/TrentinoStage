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
    SettingOutlined,
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


interface DashboardLayoutProps {
    params: any;
    messages: any;
    token: string;
    isACompany: boolean;
    profileId: string;
    styles: any;
    name: string;
    surname: string;
    address:{
        address: string;
    }
    birthDate: string;
    bio: string;
    website: string;
    sector: string;
    partitaIva: string;
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
            key: "1",
            icon: isACompany ? <BuildOutlined/> : <UserOutlined/>,
            url: `/${(params).lang}/dashboard`,
            label: isACompany ? messages["dashboard-company-profile"] : messages["dashboard-user-profile"],
        },
        {
            key: "2",
            icon: <SearchOutlined/>,
            label: messages["dashboard-offers"],
            url: `/${(params).lang}/dashboard#offers`,
        },
        {
            key: "3",
            icon: <PaperClipOutlined/>,
            label: messages["dashboard-applications"],
            url: `/${(params).lang}/dashboard#applications`
        },
        {
            key: "4",
            icon: <TeamOutlined/>,
            label: messages["dashboard-search-people"],
            url: `/${(params).lang}/dashboard#searchpeople`,
        },
        {
            key: "5",
            icon: <a href="#" onClick={() => logout()}><LogoutOutlined/></a>,
            label: <Link href="#" onClick={() => logout()}>{messages["dashboard-logout"]}</Link>,
        }
    ];

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

                        <LanguageSelector/>
                    </Header>
                    <Content className={styles.content}>
                        <main className={styles.main}>
                            {activeKey === "1" && (
                                <section key="profile">

                                    <ProfileCard session={token} id={profileId} messages={messages}
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
                            {activeKey === "2" && (
                                <section key="offers">
                                    {isACompany ? (
                                        <OfferSectionCompany session={token} id={profileId} messages={messages}/>
                                    ) : (
                                        <OfferSectionUser session={token} id={profileId} messages={messages}/>
                                    )}
                                </section>
                            )}
                            {activeKey === "3" && (
                                <section key="applications">
                                    {isACompany ? (
                                        <ApplicationSectionCompany session={token} id={profileId} messages={messages}/>
                                    ) : (
                                        <ApplicationSectionUser session={token} id={profileId} messages={messages}/>
                                    )}
                                </section>
                            )}
                            {activeKey === "4" && (
                                <section key="searchpeople">

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
    );
}
