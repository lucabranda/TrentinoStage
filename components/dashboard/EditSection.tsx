"use client"
import React from 'react';
import { Card, Form, Input, Button } from 'antd';
import { getMessages } from '@/utils/systemMessage';
const {Item} = Form;
export default async function EditSection({params}: any) {
  const messages = await getMessages((await params).lang);  // Carica i messaggi in modo sincrono

  return(
  <Card title="Edit Profile">
    <Form layout="vertical">
      <Item label="Name">
        <Input placeholder="Enter your name" />
      </Item>
      <Item label="Email">
        <Input placeholder="Enter your email" />
      </Item>
      <Button type="primary">{messages["dashboard-button-update"]}</Button>
    </Form>
  </Card>
);
}
