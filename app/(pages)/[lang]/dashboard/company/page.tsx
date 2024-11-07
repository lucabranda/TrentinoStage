import React from 'react';
import { Layout } from 'antd';
import { getMessages } from '@/utils/systemMessage';
import CompanyCard from '@/components/dashboard/CompanyCard';
import OffersSection from '@/components/dashboard/OffersSection';
import  DashboardLayout  from '../page';
import {Content } from '@/components/Layout'
export default async function CompanyPage({params}: any) {
  const messages = await getMessages((await params).lang);
  return(
    <DashboardLayout params={params}>
      <Content>
        <CompanyCard params={params}/>
        <OffersSection params={params}/>
      </Content>
    </DashboardLayout>
  );
}