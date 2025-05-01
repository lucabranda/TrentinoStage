"use client";
import {useEffect, useState} from 'react';
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
import {DashedButton, LinkButton} from "@/components/buttons/Buttons";


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
        city: string;
        region: string;
        country: string;
        postal_code: string;
        street: string;
    }
    birth_date: string;
    bio: string;
    website: string;
    sector: string;
    partitaIva: string;
    applicationsList: any;
}


enum TabKeys {
    ProfileInfo = "profileInfo",
    Offers = "offers",
    Applications = "applications",
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
                                            birth_date,
                                            bio,
                                            sector,
                                            website,
                                            partitaIva,
                                            applicationsList
                                        }: DashboardLayoutProps) {

    const [collapsed, setCollapsed] = useState(false);
    const [activeKey, setActiveKey] = useState(TabKeys.ProfileInfo);

    function logout() {
        removeSessionToken();
        window.location.reload();
    }

    const itemsSidebar = [
        {
            key: TabKeys.ProfileInfo,
            icon: isACompany ? <BuildOutlined /> : <UserOutlined />,
            url: `/${params.lang}/dashboard`,
            hash: ``,
            label: isACompany ? messages["dashboard-company-profile"] : messages["dashboard-user-profile"],
        },
        {
            key: TabKeys.Offers,
            icon: <SearchOutlined />,
            label: messages["dashboard-offers"],
            url: `/${params.lang}/dashboard#offers`,
            hash: `offers`,
        },
        {
            key: TabKeys.Applications,
            icon: <PaperClipOutlined />,
            label: messages["dashboard-applications"],
            url: `/${params.lang}/dashboard#applications`,
            hash: `applications`,
        },
    ];

    if (isACompany) {
        itemsSidebar.push({
            key: TabKeys.InviteMembers,
            icon: <TeamOutlined />,
            label: messages["dashboard-invite-members"],
            url: `/${params.lang}/dashboard#invitemembers`,
            hash: `invitemembers`,
        });
    }

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            const matchingItem = itemsSidebar.find(item => item.hash === hash);
            if (matchingItem) {
                setActiveKey(matchingItem.key);
            }
        };

        window.addEventListener('hashchange', handleHashChange);

        handleHashChange();

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

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
                        onSelect={(e: any) => {setActiveKey(e.key); window.location.hash = itemsSidebar.filter(is => is.key === e.key)[0].hash;}}
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
                            <LinkButton onClick={() => logout()}>
                                {messages["dashboard-logout"]} <LogoutOutlined/>
                            </LinkButton>
                        </div>

                    </Header>
                    <Content className={styles.content}>
                        <main className={styles.main}>
                            {activeKey === TabKeys.ProfileInfo && (
                                <section key="profile">
                                    <ProfileCard session={token} id={profileId} messages={messages}
                                                 isOwner={true}
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
                                        birth_date,
                                        address,
                                        sector,
                                        website,
                                    }) as ProfileUserData | ProfileCompanyData}
                                    closeButton={<></>}/>
                                    
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