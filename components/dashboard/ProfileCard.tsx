"use client";
import React, {useState} from "react";
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
import {ProfilesApi} from "@/api/profilesApi";

const {Title, Text} = Typography;

export interface ProfileUserData {
    name: string;
    surname: string;
    address: {
        address: string;
    };
    birthDate: string;
    bio: string;
    sector: string;
}

export interface ProfileCompanyData {
    name: string;
    address: {
        address: string;
    };
    sector: string;
    partitaIva: string;
    website: string;
}

export interface CardProps {
    session: string;
    id: string | number;
    messages: Record<string, string>;
    isCompany: boolean;
    isOwner: boolean;
    profileData: ProfileUserData | ProfileCompanyData;
}

export default function ProfileCard({session, id, messages, isCompany, isOwner = true, profileData}: CardProps) {

    const [isEditing, setIsEditing] = useState<Record<keyof ProfileUserData, boolean>>(
        {} as Record<keyof ProfileUserData, boolean>
    ); // Tracks which fields are being edited
    const [formData, setFormData] = useState<ProfileUserData | ProfileCompanyData>(profileData); // Local state for form data
    const [loading, setLoading] = useState(false);

    const handleEditClick = (field: keyof ProfileUserData) => {
        setIsEditing((prev) => ({...prev, [field]: true}));
    };

    const handleSaveClick = async () => {
        setLoading(true);
        try {
            const profilesApi = new ProfilesApi();
            isCompany ? await profilesApi.apiProfilesModifyPost(
                session,
                formData.name,
                formData.address?.address,
                formData.sector,
                (formData as ProfileCompanyData).website,
                (formData as ProfileCompanyData).partitaIva,
            ) : await profilesApi.apiProfilesModifyPost(
                session,
                formData.name,
                (formData as ProfileUserData).surname,
                formData.address?.address,
                (formData as ProfileUserData).bio,
                formData.sector,
                (formData as ProfileUserData).birthDate
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
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const renderField = (label: string, field: keyof (ProfileUserData | ProfileCompanyData), icon: React.ReactNode) => (
        <Row align="middle" style={{marginBottom: 16}}>
            <Col span={6} style={{fontWeight: "bold"}}>
                {label}:
            </Col>
                {!isOwner ? (
                    <Col span={20}>
                    <Text>
                        {field === "sector"
                            ? (formData[field] as unknown as string[])?.join(", ")
                            : field as keyof ProfileUserData === "birthDate"
                                ? (formData[field] as unknown as Date)?.toLocaleDateString()
                                : (field === "address" ? formData.address?.address : formData[field]?.toString() || "")}
                    </Text>
                    </Col>
                    
                ) : (
                    
                <>
                <Col span={20}>
                {isEditing[field] ? (
                    <Input
                        value={formData[field] as string | undefined}
                        onChange={(e) => handleChange(field, e.target.value)}
                    />
                    ) : (
                        <Text>
                            {field === "sector"
                                ? (formData[field] as unknown as string[])?.join(", ")
                                : field as keyof ProfileUserData === "birthDate"
                                    ? (formData[field] as unknown as Date)?.toLocaleDateString()
                                    : (field === "address" ? formData.address?.address : formData[field]?.toString() || "")}
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
                </>
                )}
        </Row>
    );

    return (
        <Card
            title={<Title level={4}>{profileData.name || "User Profile"}</Title>}
            extra={
                isOwner && (<Button type="primary" loading={loading} onClick={handleSaveClick}>
                                Save Changes
                            </Button>)

            }
            style={{maxWidth: 600, margin: "auto"}}
        >
            <Space direction="vertical" size="large">
                <Avatar
                    size={64}
                    icon={<UserOutlined/>}
                    style={{marginBottom: 16}}
                />
                {!isCompany ? (
                    <>
                        {renderField("Name", "name", <EditOutlined/>)}
                        {renderField("Surname", "surname" as keyof (ProfileUserData | ProfileCompanyData),
                            <EditOutlined/>)}
                        {renderField("Bio", "bio" as keyof (ProfileUserData | ProfileCompanyData), <EditOutlined/>)}
                        {renderField("Sector", "sector", <EditOutlined/>)}
                        {renderField("BirthDate", "birthDate" as keyof (ProfileUserData | ProfileCompanyData),
                            <EditOutlined/>)}
                        {renderField("Address", "address", <EditOutlined/>)}
                    </>
                ) : (
                    <>
                        {renderField("Name", "name", <EditOutlined/>)}
                        {renderField("Partita Iva", "partitaIva" as keyof (ProfileUserData |
                            ProfileCompanyData), <EditOutlined/>)}
                        {renderField("Sector", "sector", <EditOutlined/>)}
                        {renderField("Address", "address", <EditOutlined/>)}

                    </>
                )}
            </Space>
        </Card>
    );
}