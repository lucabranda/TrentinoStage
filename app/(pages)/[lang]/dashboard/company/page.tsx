import React from 'react';
import { getMessages } from '@/utils/systemMessage';
import CompanyCard from '@/components/dashboard/company/CompanyCard';
import OffersSection from '@/components/dashboard/company/OffersSection';
import { TeamOutlined, RocketOutlined, InboxOutlined, LogoutOutlined } from '@ant-design/icons';
import { Content } from '@/components/Layout/Layout';
import DashboardLayout from '@/components/Layout/DashboardLayout';  // Assuming layout is here
export default async function CompanyPage({ params }: any) {
  const messages = await getMessages((await params).lang);
  const itemsSidebar = [
    {
      key: "company",
      icon: <TeamOutlined />,
      label: <>{messages["company-team"] || "Company Team"}</>,
    },
    {
      key: "offers",
      icon: <RocketOutlined />,
      label: <>{messages["user-offers"] || "Offers"}</>,
    },
    {
      key: "applications",
      icon: <InboxOutlined />,
      label: <>{messages["user-applications"] || "Applications"}</>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: <>{messages["logout"] || "Logout"}</>,
    },
    
  ];

  return (
    <DashboardLayout itemsSidebar={itemsSidebar} params={params}>
      <Content>
        <CompanyCard messages={messages} />
        <OffersSection messages={messages} />
      </Content>
    </DashboardLayout>
  );
}
