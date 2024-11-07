import React from 'react';
import { Menu } from 'antd';
import { TeamOutlined, UserOutlined } from '@ant-design/icons';
import { getMessages } from '@/utils/systemMessage';
export default async function Sidebar({params}: any) {
  const messages = await getMessages((await params).lang);  
  const menuItems = [
    {
      key: "user",
      icon: <UserOutlined />,
      label: (
        <>
        {messages["user-profile"] || "User Profile"}
        </>
      ),
    },
    {
      key: "company",
      icon: <TeamOutlined />,
      label: (
        <>
        {messages["company-team"] || "Company Team"}
        </>
      ),
    },
];
  return (
    <Menu mode="inline" items={menuItems}  style={{ height: '100%', borderRight: 0 }} />
      
  );
};

