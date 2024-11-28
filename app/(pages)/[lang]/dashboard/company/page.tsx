import React from 'react';
import { getMessages } from '@/utils/systemMessage';
import CompanyCard from '@/components/dashboard/CompanyCard';
import OffersSection from '@/components/dashboard/OffersSection';
import { TeamOutlined, RocketOutlined, InboxOutlined, LogoutOutlined } from '@ant-design/icons';
import { Content } from '@/components/Layout/Layout';
import DashboardLayout from '@/components/Layout/DashboardLayout';  // Assuming layout is here
export default async function CompanyPage({ params }: any) {
  const messages = await getMessages((await params).lang);
  const itemsSidebar = [
    {
      key: "company",
      icon: <TeamOutlined />,
      label: <>{messages["dashboard-company-team"] || "Company Team"}</>,
    },
    {
      key: "offers",
      icon: <RocketOutlined />,
      label: <>{messages["dashboard-company-offers"] || "Offers"}</>,
    },
    {
      key: "applications",
      icon: <InboxOutlined />,
      label: <>{messages["dashboard-company-applications"] || "Applications"}</>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: <>{messages["dashboard-logout"] || "Logout"}</>,
    },
    
  ];

  return (
    <DashboardLayout itemsSidebar={itemsSidebar} params={params}>
      <Content>
        <CompanyCard messages={messages} session={params.session} id={params.id}/>
        <OffersSection messages={messages} />
      </Content>
    </DashboardLayout>
  );
}
