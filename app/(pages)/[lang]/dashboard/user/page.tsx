import React from 'react';
import { Layout } from 'antd';
import UserCard from '@/components/dashboard/user/UserCard';
import EditSection from '@/components/dashboard/user/EditSection';
import { getMessages } from '@/utils/systemMessage';
import  DashboardLayout from  '@/components/Layout/DashboardLayout';
import {Content} from '@/components/Layout/Layout';
import { InboxOutlined, LogoutOutlined, RocketOutlined, UserOutlined } from '@ant-design/icons';

export default async function UserPage({params}: any) {
  const messages = await getMessages((await params).lang);
  const items=[
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
         key: "offers",
         icon: <RocketOutlined />,
         label: (
           <>
             {messages["user-offers"] || "Offers"}
           </>
         ),
       },
       {
         key: "applications",
         icon: <InboxOutlined />,
         label: (
           <>
             {messages["user-applications"] || "Applications"}
           </>
         ),
       },
       {
         key: "logout",
         icon: <LogoutOutlined />,
         label: (
           <>
           {messages[""] || ""}
           </>
         ),
       }
     ];
  return(
    <DashboardLayout params={params} itemsSidebar={items}>
    
      <Content>
        {/* <UserCard  messages={messages} onEdit={function (): void {
          throw new Error('Function not implemented.');
        } }/> */}
        <UserCard  messages={messages} />
        <EditSection messages={messages}/>
      </Content>
    </DashboardLayout>
  );
}