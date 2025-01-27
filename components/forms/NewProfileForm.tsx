"use client";
import React from 'react'
import {getMessages} from "@/utils/systemMessage";
import {Layout} from "antd";
import {Button, Form, Input, Typography, Card, Upload} from 'antd';
//import {ProfilesApi} from "@/api/profilesApi";
import { SendOutlined, UploadOutlined } from "@ant-design/icons";

export interface NewProfileFormProps{
    token: string,
    messages: any,
    styles: any,
    isCompany: boolean
} 


export default async function NewProfileForm({token,messages, styles, isCompany}: NewProfileFormProps) {
    const msgs = await getMessages(messages.lang);
    

    /*const onFinish = async (values: any) => {
        try {
             const profilesApi = new ProfilesApi();
            const res = await profilesApi.apiProfilesNewPost(
                token,
                isCompany,
                values.name,
                values.surname,
                values.address.country,
                values.address.region,
                values.address.city,
                values.address.postal_code,
                values.address.street,
                values.address.address,
                values.birth_date,
                values.bio,
                values.identifier,
                values.sector,
                values.website
            );
    
            // Handle successful response
            if (res.response.statusCode! >= 200 && res.response.statusCode! < 300) {
                // Optionally, you can update the state or show a success message
                console.log("Profile created successfully:", res.body);
                // Redirect or show success message
            } else {
                // Handle unexpected status codes
                console.error("Unexpected response:", res);
            }
        } catch (error) {
            // Handle error case
            console.error("Error creating profile:", error);
            // Optionally show an error message to the user
        }
    };*/


  const fields = isCompany ? [
        {
            label: <span className={styles.formLabel}>{msgs["company-card-name-label"]}</span>,
            name: "name",
            rules: [{ required: true, message: msgs["error-name-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-address-label"]}</span>,
            name: "address",
            rules: [{ required: true, message: msgs["error-address-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-partita-iva-label"]}</span>,
            name: "partitaIva",
            rules: [{ required: true, message: msgs["error-partita-iva-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-profile-picture-label"]}</span>,
            name: "profilePicture",
            rules: [{ required: false, message: msgs["error-profile-picture-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-bio-label"]}</span>,
            name: "bio",
            rules: [{ required: false, message: msgs["error-bio-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-website-label"]}</span>,
            name: "website",
            rules: [{ required: false, message: msgs["error-website-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-sector-label"]}</span>,
            name: "sector",
            rules: [{ required: false, message: msgs["error-sector-not-provided"] }]
        },
    ] : [
        {
            label: <span className={styles.formLabel}>{msgs["user-card-name-label"]}</span>,
            name: "name",
            rules: [{ required: true, message: msgs["error-name-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["user-card-surname-label"]}</span>,
            name: "surname",
            rules: [{ required: true, message: msgs["error-surname-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["user-card-bio-label"]}</span>,
            name: "bio",
            rules: [{ required: false, message: msgs["error-bio-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["user-card-address-label"]}</span>,
            name: "address",
            rules: [{ required: false, message: msgs["error-address-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["user-card-profile-picture-label"]}</span>,
            name: "profilePicture",
            rules: [{ required: false, message: msgs["error-profile-picture-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["user-card-birthday-label"]}</span>,
            name: "birthDate",
            rules: [{ required: false, message: msgs["error-birthdate-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["user-card-cv-label"]}</span>,
            name: "cv",
            rules: [{ required: false, message: msgs["error-cv-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["user-card-sector-label"]}</span>,
            name: "sector",
            rules: [{ required: false, message: msgs["error-sector-not-provided"] }]
        },
    ];





    return (
        <Layout style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh"}}>
            
        <Card className={styles.formNewProfile}>
            <Form
                name="create-profile"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                initialValues={{ remember: true }}
                autoComplete="off"
                className={styles.form}
                //onFinish={onFinish}
                title={msgs["new-profile-title"] || "Create Profile"}
            >
                <Form.Item>
                    <Typography.Title level={3} className={styles.formTitle}>
                        {msgs["new-profile-title"] || "Create Profile"}
                    </Typography.Title>
                </Form.Item>
                {fields.map(field => (
                    <Form.Item
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        rules={field.rules}
                        className={styles.formItem}
                    >
                        {field.name === "profilePicture" || field.name === "cv" ? (
                            <Upload
                                name={field.name}
                                listType="picture"
                                maxCount={1}
                            >
                                <Button icon={<UploadOutlined />} style={{ width: "100%" }}>Upload</Button>
                            </Upload>
                        ) : field.name === "bio" ? (
                                <Input.TextArea className={styles.formTextArea} />
                            ) : field.name === "sector" ? (
                                <Input className={styles.formInput} type="select" />
                            ) : field.name === "birthDate" ? (
                                <Input className={styles.formInput} type="date" />
                            ) : (
                                <Input className={styles.formInput} />
                            )}
                        
                    </Form.Item>
                ))}

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit" className={styles.formButton}>
                        {msgs["user-card-submit-button"]}<SendOutlined />
                    </Button>
                </Form.Item>
            </Form>
        </Card>
        </Layout>
    );
}