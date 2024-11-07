import React from 'react';
import { Card } from 'antd';
import { getMessages } from '@/utils/systemMessage';
export default async function CompanyCard({params}: any) {
  const messages = await getMessages((await params).lang);  // Carica i messaggi in modo sincrono

  return(
  <Card title="Company Information">
    <p>Company Name</p>
    <p>Description of the company and mission statement</p>
  </Card>
);
}

