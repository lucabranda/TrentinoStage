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
    Select,
} from "antd";
import { EditOutlined, UserOutlined } from "@ant-design/icons";
import { ProfilesApi } from "@/api/profilesApi";

const { Title, Text } = Typography;
const { Option } = Select;

export interface ProfileUserData {
    name: string;
    surname: string;
    address: {
        address: string;
        city: string;
        region: string;
        country: string;
        postalCode: string;
    };
    birth_date: string;
    bio: string;
    sector: string;
}

export interface ProfileCompanyData {
    name: string;
    address: {
        address: string;
        city: string;
        region: string;
        country: string;
        postalCode: string;
    };
    sector: string;
    partitaIva: string;
    website: string;
    birth_date: string;
}

export interface CardProps {
    session: string;
    id: string | number;
    messages: Record<string, string>;
    isCompany: boolean;
    isOwner: boolean;
    profileData: ProfileUserData | ProfileCompanyData;
}

export default function ProfileCard({ session, id, messages, isCompany, isOwner = true, profileData }: CardProps) {
    const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
    const [formData, setFormData] = useState<ProfileUserData | ProfileCompanyData>(profileData);
    const [loading, setLoading] = useState(false);

    const isUserData = (data: ProfileUserData | ProfileCompanyData): data is ProfileUserData => {
        return (data as ProfileUserData).surname !== undefined;
    };

    const handleEditClick = (field: string) => {
        setIsEditing((prev) => ({ ...prev, [field]: true }));
    };

    const handleSaveClick = async () => {
        if (!formData.name || !formData.address?.city) {
            message.warning("Name and City are required fields");
            return;
        }
        setLoading(true);
        try {
            const profilesApi = new ProfilesApi();
            if (isCompany) {
                await profilesApi.apiProfilesModifyPost(
                    session,
                    formData.name,
                    formData.address?.address,
                    formData.address?.city,
                    formData.address?.region,
                    formData.address?.country,
                    formData.address?.postalCode,
                    formData.sector,
                    (formData as ProfileCompanyData).website,
                    (formData as ProfileCompanyData).partitaIva,
                );
            } else {
                await profilesApi.apiProfilesModifyPost(
                    session,
                    formData.name,
                    (formData as ProfileUserData).surname,
                    formData.address?.address,
                    formData.address?.city,
                    formData.address?.region,
                    formData.address?.country,
                    formData.address?.postalCode,
                    (formData as ProfileUserData).bio,
                    formData.sector,
                    (formData as ProfileUserData).birth_date?.substring(0, 10)
                );
            }
            message.success(messages.success || "Profile updated successfully");
            setIsEditing({});
        } catch (error) {
            message.error(messages.error || "Error updating profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        if (field === "address") {
            setFormData((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    ...value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    const renderField = (label: string, field: string, icon: React.ReactNode) => {
        if (field === "address") {
            return ["address", "city", "region", "country", "postalCode"].map((subField) => (
                <Row align="middle" style={{ marginBottom: 8 }} key={subField}>
                    <Col span={7} style={{ fontWeight: "bold" }}>
                        {messages[`user-card-${subField}-label`] || subField}:
                    </Col>
                    <Col span={17}>
                        {isEditing["address"] && isOwner ? (
                            <Input
                                style={{ backgroundColor: "#f6ffed" }}
                                value={formData.address?.[subField as keyof typeof formData.address] || ""}
                                onChange={(e) => handleChange("address", { [subField]: e.target.value })}
                                onPressEnter={handleSaveClick}
                            />
                        ) : (
                            <Text>{formData.address?.[subField as keyof typeof formData.address] || "-"}</Text>
                        )}
                    </Col>
                    {subField === "address" && isOwner && (
                        <Col span={4}>
                            <Button icon={icon} type="link" onClick={() => handleEditClick("address")} />
                        </Col>
                    )}
                </Row>
            ));
        }

        return (
            <Row align="middle" style={{ marginBottom: 16 }} key={field}>
                <Col span={7} style={{ fontWeight: "bold" }}>{label}:</Col>
                <Col span={17}>
                    {isEditing[field] && isOwner ? (
                        field === "sector" ? (
                            <Select
                                mode="tags"
                                style={{ width: "100%" }}
                                value={formData.sector?.split(", ") || []}
                                onChange={(value) => handleChange("sector", value.join(", "))}
                            >
                                {(formData.sector?.split(", ") || []).map((tag) => (
                                    <Option key={tag} value={tag}>{tag}</Option>
                                ))}
                            </Select>
                        ) : (
                            <Input
                                type={field === "birth_date" ? "date" : "text"}
                                value={
                                    field === "birth_date"
                                        ? new Date(formData[field as keyof (ProfileUserData | ProfileCompanyData)] as string).toISOString().substring(0, 10)
                                        : (formData[field as keyof (ProfileUserData | ProfileCompanyData)] as string) || ""
                                }
                                style={{ backgroundColor: "#f6ffed" }}
                                onChange={(e) => handleChange(field, e.target.value)}
                                onPressEnter={handleSaveClick}
                            />


                        )
                    ) : (
                        <Text>
                        {field === "birth_date"
                            ? new Date(formData[field as keyof (ProfileUserData | ProfileCompanyData)] as string).toLocaleDateString()
                            : (formData[field as keyof (ProfileUserData | ProfileCompanyData)] as string) || "-"}
                    </Text>
                     )}
                </Col>
                {isOwner && (
                    <Col span={4}>
                        <Button icon={icon} type="link" onClick={() => handleEditClick(field)} />
                    </Col>
                )}
            </Row>
        );
    };

    return (
        <Card
            title={<Title level={4}>{formData.name || "User Profile"}</Title>}
            extra={isOwner && (
                <Button type="primary" loading={loading} onClick={handleSaveClick}>
                    Save Changes
                </Button>
            )}
            style={{ maxWidth: 600, margin: "auto" }}
        >
            <Space direction="vertical" size="large">
                <Avatar size={64} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
                {renderField(messages["user-card-name-label"], "name", <EditOutlined />)}
                {!isCompany ? (
                    <>
                        {isUserData(formData) && renderField(messages["user-card-surname-label"], "surname", <EditOutlined />)}
                        {isUserData(formData) && renderField(messages["user-card-bio-label"], "bio", <EditOutlined />)}
                        {renderField(messages["user-card-sector-label"], "sector", <EditOutlined />)}
                        {isUserData(formData) && renderField(messages["user-card-birth-date-label"], "birth_date", <EditOutlined />)}
                        {renderField(messages["user-card-address-label"], "address", <EditOutlined />)}
                    </>
                ) : (
                    <>
                        {renderField(messages["company-card-partita-iva-label"], "partitaIva", <EditOutlined />)}
                        {renderField(messages["company-card-sector-label"], "sector", <EditOutlined />)}
                        {renderField(messages["company-card-address-label"], "address", <EditOutlined />)}
                        {renderField(messages["company-card-website-label"], "website", <EditOutlined />)}
                    </>
                )}
            </Space>
        </Card>
    );
}
