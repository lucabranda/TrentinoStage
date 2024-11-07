import React from 'react';
import { Card, Avatar, Space, Row, Col, Typography } from 'antd';
import { getMessages } from '@/utils/systemMessage';
import {Title, Text} from '@/components/Typography';
export default async function UserCard({params}: any) {
  const messages = await getMessages((await params).lang);  // Carica i messaggi in modo sincrono

  return (
    <Card title="User Profile" className="user-card">
      <Space direction="vertical" size="large">
        <Avatar size={64} src="path/to/user-image.jpg" />
        <Row justify="space-between">
          <Col>
            <Title level={4}>User Name</Title>
          </Col>
          <Col>
            <Text type="secondary">User description or role</Text>
          </Col>
        </Row>
      </Space>
    </Card>
  );
}


