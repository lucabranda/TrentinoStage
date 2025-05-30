"use client";
import React, {useEffect, useState} from "react";
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
    DatePicker,
    Upload
} from "antd";
import {
    CloseCircleOutlined,
    CloseOutlined,
    DeleteOutlined,
    EditOutlined,
    SaveOutlined,
    UploadOutlined,
    UserOutlined,
    DownloadOutlined
} from "@ant-design/icons";
import {DashedButton, LinkButton} from "../buttons/Buttons";
import {sectors, regions, countries, cities} from "@/utils/enums";
import dayjs from 'dayjs';
import { isDeepStrictEqual } from "util";
import { set } from "mongoose";
const {Title, Text} = Typography;
const {Option} = Select;

export interface ProfileUserData {
    name: string;
    surname: string;
    address: {
        address: string;
        city: string;
        region: string;
        country: string;
        postal_code: string;
        street: string;
    };
    birth_date: string;
    bio: string;
    sector: string;
    profile_image: string;
    identifier: string;
    email: string;
}

export interface ProfileCompanyData {
    name: string;
    address: {
        address: string;
        city: string;
        region: string;
        country: string;
        postal_code: string;
        street: string;
    };
    sector: string;
    identifier: string;
    website: string;
    birth_date: string;
    bio: string;
    profile_image: string;
    email: string;
}

export interface CardProps {
    session: string;
    id: string | number;
    messages: Record<string, string>;
    isCompany: boolean;
    isOwner: boolean;
    profileData: ProfileUserData | ProfileCompanyData;
    profile_id_for_cv: string;
}

export default function ProfileCard({session, id, messages, isCompany, isOwner = true, profileData,profile_id_for_cv=''} : CardProps) {
    const [showEdit, setShowEdit] = useState(false);
    const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});

    const [formData, setFormData] = useState<ProfileUserData | ProfileCompanyData>(profileData);
    const [loading, setLoading] = useState(false);

    const [country, setCountry] = useState("ITALY");
    useEffect(() => {
        setCountry((document.getElementById("country") as HTMLSelectElement)?.value as string);
    }, []);
    const [region, setRegion] = useState("TRENTINOALTOADIGE");
    useEffect(() => {
        setRegion((document.getElementById("region") as HTMLSelectElement)?.value as string);
    }, []);
    const [city, setCity] = useState("TRENTO");
    useEffect(() => {
        setCity((document.getElementById("city") as HTMLSelectElement)?.value as string);
    }, []);

    // State to check if a CV exists for this user
    const [cvExists, setCvExists] = useState(false);
    const [loadingCv, setLoadingCv] = useState(false);

    // Add these states at the beginning of the component
    const [loadingUpload, setLoadingUpload] = useState(false);
    const [loadingDownload, setLoadingDownload] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    // Check if CV exists (for both user and company views)
    useEffect(() => {
        if (!isCompany) {
            // For user, check own CV
            fetch(`/api/cv?token=${session}&profileId=${id}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${session}` }
            })
                .then(res => setCvExists(res.ok))
                .catch(() => setCvExists(false));
        } else if(!isOwner){
            console.log("Checking CV for company view");
            fetch(`/api/cv?token=${session}&profileId=${profile_id_for_cv}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${session}` }
            })
                .then(res => {setCvExists(res.ok); setLoadingCv(false)})
                .catch(() => {setCvExists(false) });
        }
    }, [id, session, isCompany]);

    const handleEditClick = (field: string, b: boolean) => {
        setIsEditing((prev) => ({...prev, [field]: b}));
    };


    const handleSaveClick = async () => {
        if (!formData.name || !formData.address?.city) {
            message.warning("Name and City are required fields");
            return;
        }
        setLoading(true);
        try {
            const address = {
                address: formData.address?.address,
                city: formData.address?.city,
                region: formData.address?.region,
                country: formData.address?.country,
                postal_code: formData.address?.postal_code,
                street: formData.address?.street
            }
            const res = await fetch("/api/profiles", {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    sessionToken: session,
                    is_company: isCompany,
                    name: formData.name,
                    address: address,
                    street: formData.address?.street,
                    sector: [formData.sector].join(","),
                    ...(isCompany ? {website: (formData as ProfileCompanyData).website} : {surname: (formData as ProfileUserData).surname}),
                    ...(!isCompany && {birth_date: (formData as ProfileUserData).birth_date}),
                    identifier: formData.identifier,
                    bio: formData.bio,
                    profile_image: formData.profile_image
                }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                console.error(errorData);
                throw new Error(errorData.error);
            }

            message.success(messages.success || "Profile updated successfully");
            setIsEditing({});
            setShowEdit(false)
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

    const renderField = (label: string, field: string) => {
        if (field === "address") {

            return ["country", "region", "city", "postal_code", "street", "address"].map((subField) => (
                <Row align="middle" style={{
                    marginBottom: 16,
                    width: "fit-content",
                    justifyContent: "space-between",
                    paddingInlineStart: 16,
                    display: "flex"
                }} key={field}>
                    <Space style={{width: '20rem !important'}}>
                        <Col style={{fontWeight: "bold"}}>
                            {messages[`user-card-${subField}-label`] || subField}:
                        </Col>
                        <Col style={{marginLeft: 16, width: "15rem"}}>
                            {isEditing["address"] && isOwner ? (
                                (subField === "country") ? (
                                    <Select
                                        style={{width: "100%"}}
                                        placeholder={messages["select-default"] || "---"}
                                        id="country"
                                        onChange={(value) => {
                                            handleChange("address", {[subField]: value});
                                            setCountry(value);
                                        }}
                                    >
                                        {Object.entries(countries).map(([key, label]) => (
                                            <Select.Option key={key} value={key}>
                                                {messages[`enum-country-${key}`]}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                ) : (subField === "region") ? (
                                    (country === "ITALY") ? (
                                            <Select

                                                style={{width: "100%"}}
                                                placeholder={messages["select-default"] || "---"}
                                                id="region"
                                                onChange={(value) => {
                                                    handleChange("address", {[subField]: value});
                                                    setRegion(value);
                                                }}
                                            >
                                                {Object.entries(regions).map(([key, label]) => (
                                                    <Select.Option key={key} value={key}>
                                                        {messages[`enum-region-${key}`]}
                                                    </Select.Option>
                                                ))}
                                            </Select>)
                                        : (
                                            <Input
                                                style={{backgroundColor: "#f6ffed"}}
                                                value={messages[`enum-region-${formData.address?.[subField as keyof typeof formData.address] || "-"}`]}
                                                onChange={(e) => handleChange("address", {[subField]: e.target.value})}
                                                onPressEnter={handleSaveClick}
                                                id={subField}
                                            />
                                        )
                                ) : (subField === "city") ? (
                                    (region === "TRENTINOALTOADIGE") ? (
                                        <Select

                                            style={{width: "100%"}}
                                            placeholder={messages["select-default"] || "---"}
                                            id="city"
                                            onChange={(value) => {
                                                handleChange("address", {[subField]: value});
                                                setCity(value)
                                            }}
                                        >
                                            {Object.entries(cities).map(([key, label]) => (
                                                <Select.Option key={key} value={key}>
                                                    {cities[key as keyof typeof cities] as string}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    ) : (
                                        <Input
                                            style={{backgroundColor: "#f6ffed"}}
                                            value={messages[`enum-city-${formData.address?.[subField as keyof typeof formData.address] || "-"}`]}
                                            onChange={(e) => handleChange("address", {[subField]: e.target.value})}
                                            onPressEnter={handleSaveClick}
                                            id="city"
                                        />
                                    )
                                ) : (
                                    <Input
                                        style={{backgroundColor: "#f6ffed"}}
                                        value={formData.address?.[subField as keyof typeof formData.address] || "-"}
                                        onChange={(e) => handleChange("address", {[subField]: e.target.value})}
                                        onPressEnter={handleSaveClick}
                                        id={subField}
                                    />
                                )
                            ) : (
                                <Text id={subField}>
                                    {subField === "country" || subField === "region"
                                        ? messages[`enum-${subField}-${formData.address?.[subField as keyof typeof formData.address]}`]
                                        : subField === "city" && formData.address?.region === "TRENTINOALTOADIGE"
                                            ? cities[formData.address?.[subField as keyof typeof formData.address] as keyof typeof cities] as string
                                            : formData.address?.[subField as keyof typeof formData.address]?.toString() || ""}
                                </Text>
                            )
                            }
                        </Col>
                    </Space>
                </Row>
            ));
        }

        return (
            <Row align="middle" style={{
                marginBottom: 16,
                width: "100%",
                justifyContent: "space-between",
                paddingInlineEnd: 16,
                display: "inline-flex"
            }} key={field}>
                <Space style={{display: "flex", maxWidth: (field === "bio") ? "75%" : "90%"}}>
                    <Col style={{fontWeight: "bold"}}>{label}:</Col>
                    <Col style={{marginLeft: 16, display: "flex", width: "15rem"}}>
                        {isEditing[field] && isOwner ? (
                            field === "sector" ? (
                                <Select
                                    style={{width: "100%"}}
                                    placeholder={messages["select-default"] || "---"}
                                    id="sector"
                                    onChange={(value) => handleChange("sector", value)}
                                >
                                    {Object.entries(sectors).map(([key, label]) => (
                                        <Select.Option key={key} value={key}>
                                            {messages[`enum-sector-${key}`]}
                                        </Select.Option>
                                    ))}
                                </Select>
                            ) : (
                                (field === "birth_date") ?
                                    (<DatePicker
                                        style={{
                                            backgroundColor: "#f6ffed",
                                            display: "flex",
                                            padding:2
                                        }}
                                        onChange={(value) => {handleChange("birth_date", value.toISOString())}}
                                    />)
                                    :(
                                    <Input
                                        type={"text"}
                                        value={(formData[field as keyof (ProfileUserData | ProfileCompanyData)] as string) || ""}
                                        style={{
                                            backgroundColor: "#f6ffed",
                                            display: "flex",
                                            padding: (field === "bio") ? 24 : 2
                                        }}
                                        onChange={(e) => handleChange(field, e.target.value)}
                                        onPressEnter={handleSaveClick}
                                        id={field}
                                    />)
                            )
                        ) : (
                           
                               <Text id={field}>
                                { field === "birth_date" ?
                                    (new Date(formData["birth_date"] as string)).toLocaleDateString() || "Invalid"
                                    : field === "sector" ?
                                    messages[`enum-sector-${formData[field as keyof (ProfileUserData | ProfileCompanyData)]}`] 
                                    : (formData[field as keyof (ProfileUserData | ProfileCompanyData)] as string) || ""
                                }
                            </Text>
                        )}
                    </Col>
                </Space>
                {isOwner && showEdit && (
                    <Col style={{display: "flex"}}>
                        {isEditing[field] ? (
                            <DashedButton onClick={() => handleEditClick(field, false)}>
                                <CloseOutlined/>
                            </DashedButton>
                        ) : (
                            <LinkButton onClick={() => handleEditClick(field, true)}>
                                <EditOutlined/>
                            </LinkButton>
                        )}
                    </Col>
                )}
            </Row>
        );
    };

    // Upload logic (only for users and if owner)
    const uploadProps = {
        name: 'cv',
        accept: '.pdf',
        showUploadList: false,
        postOrPut: cvExists ? "PUT" : "POST",
        customRequest: async (options: any) => {
            setLoadingUpload(true);
            const formData = new FormData();
            formData.append('file', options.file);
            formData.append('token', session);

            try {
                const res = await fetch('/api/cv', {
                    method: uploadProps.postOrPut,
                    headers: { Authorization: `Bearer ${session}` },
                    body: formData,
                });
                if (res.ok) {
                    message.success(messages['cv-upload-success'] || 'CV uploaded successfully');
                    setCvExists(true);
                } else {
                    message.error(messages['cv-upload-fail'] || 'Upload failed');
                }
            } catch {
                message.error(messages['cv-upload-fail'] || 'Upload failed');
            } finally {
                setLoadingUpload(false);
            }
        }
    };

    // Download logic (only for companies)
    const handleDownload = async () => {
        setLoadingDownload(true);
        try {
            const res = await fetch(`/api/cv?token=${session}&profileId=${profile_id_for_cv}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${session}` }
            });
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            // Ensure correct MIME type for octet-stream
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/octet-stream' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cv.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            message.error(messages['cv-download-fail'] || 'Download failed');
        } finally {
            setLoadingDownload(false);
        }
    };

    const handleDelete = async () => {
        setLoadingDelete(true);
        try {
            const res = await fetch(`/api/cv?token=${session}&profileId=${profile_id_for_cv}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${session}` }
            });
            if (!res.ok) throw new Error();
            message.success(messages['cv-delete-success'] || 'CV deleted successfully');
            setCvExists(false);
        } catch {
            message.error(messages['cv-delete-fail'] || 'Delete failed');
        } finally {
            setLoadingDelete(false);
        }
    };
    return (
        <Card
            title={
            <Space direction="horizontal" size="large" style={{width: "100%", justifyContent: "space-between"}}>
                <Title level={4}>{formData.name || "User Profile"}</Title>

            </Space>
        }

            extra={isOwner && (
                showEdit ?
                    (
                        <div style={{display: "flex", gap: 16}}>
                            <LinkButton onClick={() => setShowEdit(false)}>
                                {messages["dashboard-profile-card-cancel"] || "Cancel"}
                            </LinkButton>
                            <Button type="primary" loading={loading} onClick={handleSaveClick}>
                                {messages["dashboard-profile-card-save"] || "Save"} <SaveOutlined/>
                            </Button>
                        </div>
                    )
                    :
                    (
                        <Button type="primary" onClick={() => setShowEdit(true)}>
                            {messages["dashboard-profile-card-edit"] || "Edit"} <EditOutlined/>
                        </Button>
                    )
            )}
            style={{ margin: "auto"}}
        >
            <Space direction="vertical" size="large" style={{width: "100%", maxHeight: 600, overflowY: "scroll"}}>
                <Row align="middle" style={{
                    marginBottom: 16,
                    width: "100%",
                    justifyContent: "space-between",
                    paddingInlineEnd: 16
                }} key={"profile_image"}>
                    {(isOwner && showEdit) ? (
                        <Col> {formData.profile_image && (
                                <Avatar
                                    size={64}
                                    src={formData.profile_image}
                                    alt="Profile Image"
                                    style={{ marginTop: 16 }}
                                />
                            )}
                            <Upload
                                name="profile_image"
                                listType="picture"
                                maxCount={1}
                                showUploadList={false}
                                beforeUpload={file => {
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                        const imageData = e.target?.result as string;
                                        setFormData({...formData, profile_image: imageData});
                                    };
                                    reader.readAsDataURL(file);
                                    // Prevent upload
                                    return false;
                                }}
                            >
                                <Button icon={<UploadOutlined />} style={{ width: "100%" }}>
                                    Upload
                                </Button>
                            </Upload>
                           
                        </Col>
                    ) : (
                        <Col>
                            <Avatar size={64} icon={formData.profile_image ? <img src={formData.profile_image} alt="Profile Image" /> : <UserOutlined/>} className="avatar-logo" style={{marginBottom: 16}}/>
                        </Col>
                    )}
                </Row>
    
                {!isCompany ? (
                    <>
                        {renderField(messages["user-card-name-label"], "name")}
                        {isOwner && renderField(messages["user-card-surname-label"], "surname")}
                        {isOwner && renderField(messages["user-card-identifier-label"], "identifier")}
                        {renderField(messages["user-card-bio-label"], "bio",)}
                        {renderField(messages["user-card-sector-label"], "sector")}
                        {isOwner && renderField(messages["user-card-birth-date-label"], "birth_date")}

                        <Row align="middle" style={{
                            marginBottom: 16,
                            width: "100%",
                            justifyContent: "space-between",
                            paddingInlineEnd: 16
                        }} key={"address"}>
                            <Col style={{fontWeight: "bold"}}>{messages["user-card-address-label"]}</Col>
                            {isOwner && showEdit && (

                                <Col>
                                    {isEditing["address"] ? (
                                        <DashedButton onClick={() => handleEditClick("address", false)}>
                                            <CloseOutlined/>
                                        </DashedButton>
                                    ) : (
                                        <LinkButton onClick={() => handleEditClick("address", true)}>
                                            <EditOutlined/>
                                        </LinkButton>
                                    )}
                                </Col>
                            )}

                        </Row>

                        {renderField(messages["user-card-address-label"], "address")}

                    </>

                ) : (
                    <>
                        {renderField(messages["user-card-name-label"], "name")}
                        {renderField(messages["company-card-partita-iva-label"], "identifier")}
                        {renderField(messages["company-card-sector-label"], "sector")}
                        <Row align="middle" style={{
                            marginBottom: 16,
                            width: "100%",
                            justifyContent: "space-between",
                            paddingInlineEnd: 16
                        }} key={"address"}>
                            <Col style={{fontWeight: "bold"}}>{messages["user-card-address-label"]}</Col>
                            {isOwner && showEdit && (

                                <Col>
                                    {isEditing["address"] ? (
                                        <DashedButton onClick={() => handleEditClick("address", false)}>
                                            <CloseOutlined/>
                                        </DashedButton>
                                    ) : (
                                        <LinkButton onClick={() => handleEditClick("address", true)}>
                                            <EditOutlined/>
                                        </LinkButton>
                                    )}
                                </Col>
                            )}

                        </Row>
                        {renderField(messages["company-card-address-label"], "address")}
                        {renderField(messages["company-card-website-label"], "website")}

                    </>
                )}

                {/* CV Upload/Download Section */}
                <div style={{ marginTop: 16, display: "flex", flexDirection: "row", gap: 4 }}>
                    {!isCompany && isOwner && (
                        <>
                       <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />} loading={loadingUpload}>
                                {messages['cv-upload'] || 'Upload CV (PDF)'}
                            </Button>
                        </Upload>
                        {cvExists && (
                            <>
                            <Button icon={<DownloadOutlined />} loading={loadingDownload} onClick={handleDownload} style={{ borderColor: "#1890ff", color: "#1890ff"}}>
                                {messages['cv-download'] || 'Download CV'}
                            </Button>
                            <Button icon={<DeleteOutlined />} loading={loadingDelete} onClick={handleDelete} disabled={!cvExists} style={{ borderColor: "red", color: "red"}}>
                                {messages['cv-delete'] || 'Delete CV'}
                            </Button>
                            </>
                        )}
                        </>
                    )}
                    {isCompany && (
                        loadingUpload || loadingDownload || loadingDelete ? (
                            <span style={{ marginLeft: 8 }}>
                                <span className="ant-spin-dot ant-spin-dot-spin" style={{ fontSize: 18 }}>
                                    <i className="ant-spin-dot-item" />
                                    <i className="ant-spin-dot-item" />
                                    <i className="ant-spin-dot-item" />
                                    <i className="ant-spin-dot-item" />
                                </span>
                                {messages['cv-loading'] || 'Loading...'}
                            </span>
                        ) : (
                            cvExists && (
                                <Button
                                    icon={<DownloadOutlined />}
                                    loading={loadingDownload}
                                    onClick={handleDownload}
                                    style={{ marginLeft: 8 }}
                                >
                                    {messages['cv-download'] || 'Download CV'}
                                </Button>
                            )
                        )
                    )}
                    {!isCompany && cvExists && (
                        <span style={{ marginLeft: 8, color: 'green' }}>
                            {messages['cv-uploaded'] || 'CV uploaded'}
                        </span>
                    )}
                </div>
            </Space>
        </Card>
    );
}
