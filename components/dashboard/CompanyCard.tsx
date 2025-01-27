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

interface ProfileCompanyData {
  name: string;
  address: string;
  sector: string;
  website: string;
}


interface CompanyCardProps {
  session: string;
  id: string | number;
  messages: Record<string, string>;
  profileData: ProfileCompanyData;
}

export default function CompanyCard({
  session,
  id,
  messages,
  profileData,
}: CompanyCardProps) {
  const [isEditing, setIsEditing] = useState<Record<keyof ProfileCompanyData, boolean>>(
    {} as Record<keyof ProfileCompanyData, boolean>
  ); // Tracks which fields are being edited
  const [formData, setFormData] = useState<ProfileCompanyData>(profileData); // Local state for form data
  const [loading, setLoading] = useState(false);

  const handleEditClick = (field: keyof ProfileCompanyData) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
  };

  const handleSaveClick = async () => {
    setLoading(true);
    try {
      const api = new ProfilesApi();
      await api.apiProfilesModifyPost(
        session,
        formData.name,
        formData.address,
        formData.sector
      );
      message.success(messages.success || "Profile updated successfully");
      setIsEditing(
        {} as Record<keyof ProfileCompanyData, boolean>
      );
    } catch (error) {
      message.error(messages.error || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProfileCompanyData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderField = (label: string, field: keyof ProfileCompanyData , icon: React.ReactNode) => (
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
      title={<Title level={4}>{profileData.name || "Company Profile"}</Title>}
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
          //src={profileData.profilePicture}
          icon={ <UserOutlined />}
          style={{ marginBottom: 16 }}
        />
        {renderField("Name", "name", <EditOutlined />)}
        {renderField("Address", "address", <EditOutlined />)}
        {renderField("Sector", "sector", <EditOutlined />)}
        {renderField("Website", "website", <EditOutlined />)}
      </Space>
    </Card>
  );
}
