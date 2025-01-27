"use client";
import React, { useState } from "react";
import {
  Card,
  Avatar,
  Input,
  Button,
  Typography,
  Space,
  Row,
  Col,
  message,
} from "antd";
import {
  EditOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ProfilesApi } from "@/api/profilesApi";

const { Title, Text } = Typography;

interface ProfileUserData {
  name: string;
  surname: string;
  address: string;
  birthDate: string;
  bio: string;
  sector: string;
}

interface UserCardProps {
  session: string;
  id: string | number;
  messages: Record<string, string>;
  profileData: ProfileUserData;
}

export default function UserCard({ session, id, messages, profileData }: UserCardProps) {
  const [isEditing, setIsEditing] = useState<Record<keyof ProfileUserData, boolean>>(
    {} as Record<keyof ProfileUserData, boolean>
  ); // Tracks which fields are being edited 
  const [formData, setFormData] = useState<ProfileUserData>(profileData); // Local state for form data
  const [loading, setLoading] = useState(false);

  const handleEditClick = (field: keyof ProfileUserData) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
  };

  const handleSaveClick = async () => {
    setLoading(true);
    try {
      const profilesApi = new ProfilesApi();
      await profilesApi.apiProfilesModifyPost(
        session,
        formData.name,
        formData.surname,
        formData.address,
        formData.bio,
        formData.sector
      );
      message.success(messages.success || "Profile updated successfully");
      setIsEditing(
        {} as Record<keyof ProfileUserData, boolean>
      );
    } catch (error) {
      message.error(messages.error || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProfileUserData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderField = (label: string, field: keyof ProfileUserData , icon: React.ReactNode) => (
    <Row align="middle" style={{ marginBottom: 16 }}>
      <Col span={6} style={{ fontWeight: "bold" }}>
        {label}:
      </Col>
      <Col span={20} >
        {isEditing[field] ? (
          <Input
            value={formData[field] as string | undefined}
            onChange={(e) => handleChange(field, e.target.value)}
          />
        ) : (
          <Text>
            {field === "sector"
              ? (formData[field] as unknown as string[])?.join(", ")
              : field === "birthDate"
              ? (formData[field] as unknown as Date)?.toLocaleDateString()
              : formData[field]?.toString() || ""}
          </Text>
        )}
      </Col>
      <Col span={4}>
        <Button
          icon={icon}
          type="link"
          onClick={() => handleEditClick(field)}
        />
      </Col>
    </Row>
  );

  return (
    <Card
      title={<Title level={4}>{profileData.name || "User Profile"}</Title>}
      extra={
        <Button type="primary" loading={loading} onClick={handleSaveClick}>
          Save Changes
        </Button>
      }
      style={{ maxWidth: 600, margin: "auto" }}
    >
      <Space direction="vertical" size="large">
        <Avatar
          size={64}
           icon={<UserOutlined />}
          style={{ marginBottom: 16 }}
        />

        {renderField("Name", "name",  <EditOutlined />)}
        {renderField("Surname", "surname",  <EditOutlined />)}
        {renderField("Bio", "bio",  <EditOutlined />)}
        {renderField("Sector", "sector",  <EditOutlined />)}
      
      </Space>
    </Card>
  );
}