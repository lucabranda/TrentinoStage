import React from 'react';
import { Layout } from 'antd';
import { getMessages } from '@/utils/systemMessage';
import CompanyCard from '@/components/dashboard/CompanyCard';
import OffersSection from '@/components/dashboard/OffersSection';
import  DashboardLayout  from '../layout';
import {Content } from '@/components/Layout'
export default async function CompanyPage({params}: any) {
  const messages = await getMessages((await params).lang);
  return(
      <Content>
        <CompanyCard  messages={messages}/>
        <OffersSection  messages={messages}/>
      </Content>
  );
}