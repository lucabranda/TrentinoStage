"use client";
import React, {useState, useEffect} from 'react';
import { Card, Avatar, Space, Row, Col, Typography, Button, Badge, Spin } from 'antd';
import {Title, Text, Paragraph} from '@/components/Typography';
import { EditOutlined } from '@ant-design/icons';
import EditSection from './EditSection';

interface UserCardProps {
  session: string;
  id: string | number;
  messages: Record<string, string>;
}

interface ProfileData {
  name?: string;
  surname?: string;
  birthDate?: Date;
  address?: {
    country?: string;
    region?: string;
    city?: string;
    postalCode?: string;
    street?: string;
    address?: string;
  };
  bio?: string;
  identifier?: string;
  sector?: string[];
  cv?: string;
  profilePicture?: string;

}

export default function UserCard({ session, id, messages }: UserCardProps) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`/api/profiles/get?session=${session}&id=${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch profile data.");
        }
        const data = await res.json();
        setData(data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [session, id]);

  const userFields = [
    {
      value:data?.name,
      label: messages["user-card-name-label"],
      type: "text",
      maxLength: 50,
    },
    {
      value:data?.surname,
      label: messages["user-card-surname-label"],
      type: "text",
      maxLength: 50,
    },
    {
      value:data?.bio, 
      label: messages["user-card-bio-label"],
      type: "text",
      maxLength: 200,
    },
    {
      value:data?.address,
      label: messages["user-card-address-label"],
      type: "text",
      maxLength: 200,
    },
    {
      value:data?.profilePicture,
      label: messages["user-card-profile-picture-label"],
      type: "file",
    },
    {
      value:data?.birthDate,
      label: messages["user-card-birthday-label"],
      type: "date",
    },
    {
      value:data?.sector,
      label: messages["user-card-sector-label"],
      type: "text",
      maxLength: 50,
    },
    {
      value:data?.cv,
      label: messages["user-card-cv-label"],
      type: "file",
    },
  ];
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spin tip={messages["loading-text"] || "Loading..."} />
      </div>
    );
  }

  return (
    <Card className="user-card" extra={<Button type="text" icon={<EditOutlined />} />}>
      <Row align="middle" justify="space-between">
        <Col>
          <Avatar size={64}  />
        </Col>
        <Col>
          <Title level={4}></Title>
          <Paragraph type="secondary" ellipsis={{ rows: 2 }}></Paragraph>
        </Col>
      </Row>
      <Row align="middle" justify="space-between" className="user-card-extra">
        <Col>
          <Space direction="vertical">
            <Text><Badge status="success" text={messages["user-card-connected"]} /></Text>
            <Text>{messages["user-card-last-login"]}</Text>
          </Space>
        </Col>
        <Col>
          <Space direction="vertical">
            <Text><Badge status="warning" text={messages["user-card-companies"]} /></Text>
            <Text>{messages["user-card-last-visit"]}</Text>
          </Space>
        </Col>
      </Row>
      <EditSection fields={userFields} messages={messages}/>
    </Card>
  );
}


