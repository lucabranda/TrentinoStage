import React from 'react';
import { Layout } from 'antd';
import UserCard from '@/components/dashboard/UserCard';
import EditSection from '@/components/dashboard/EditSection';
import { getMessages } from '@/utils/systemMessage';
import styles from './dashboard.module.css';
import  DashboardLayout from  '../page';
import {Content} from '@/components/Layout';

export default async function UserPage({params}: any) {
  const messages = await getMessages((await params).lang);
  return(
    <DashboardLayout params={params}>
      <Content>
        <UserCard params={params} />
        <EditSection params={params}/>
      </Content>
    </DashboardLayout>
  );
}