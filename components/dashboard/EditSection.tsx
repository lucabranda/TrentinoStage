"use client"
import React from 'react';
import { Card, Form, Input, Button } from 'antd';
const {Item} = Form;
export default function EditSection({ messages }: { messages: any }) {

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
