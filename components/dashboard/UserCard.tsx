import React from 'react';
import { Card, Avatar, Space, Row, Col, Typography } from 'antd';
import {Title, Text} from '@/components/Typography';
export default function UserCard({ messages }: { messages: any }) {
  
  return (
    <Card title="User Profile" className="user-card">
      <Row align="middle" justify="space-between">
        <Col>
          <Avatar size={64} src="path/to/user-image.jpg" />
        </Col>
        <Col>
          <Title level={4}>User Name</Title>
          <Text type="secondary">User description or role</Text>
        </Col>
      </Row>
    </Card>
  );
}


