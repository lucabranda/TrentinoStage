import React from 'react';
import { Menu } from 'antd';
import { TeamOutlined, UserOutlined } from '@ant-design/icons';
export default function Sidebar({ messages }: { messages: any }) {
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

