import React from 'react';
import { Card, Avatar, Space, Row, Col, Typography, Button } from 'antd';
import {Title, Text} from '@/components/Typography';
import { EditOutlined } from '@ant-design/icons';
export default function UserCard({ messages }: { messages: any }) {
  
  return (
    <Card title="User Profile" className="user-card" extra={<Button type="text" icon={<EditOutlined />} />}>
      <Row align="middle" justify="space-between">
        <Col>
          <Avatar size={64} src="path/to/user-image.jpg" />
        </Col>
        <Col>
          <Title level={4}>User Name</Title>
          <Text type="secondary">User description or role</Text>
        </Col>
      </Row>
      <Row align="middle" justify="space-between" className="user-card-extra">
        <Col>
          <Space direction="vertical">
            <Text>Some other data or statistics</Text>
            <Text>Another line of data</Text>
          </Space>
        </Col>
        <Col>
          <Space direction="vertical">
            <Text>Some other data or statistics</Text>
            <Text>Another line of data</Text>
          </Space>
        </Col>
      </Row>
    </Card>
  );
}

