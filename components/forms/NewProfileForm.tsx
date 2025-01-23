"use client";
import React, { useState } from 'react';
import { isLoggedIn, checkSessionToken } from "@/utils/session";
import {getMessages} from "@/utils/systemMessage";
import {Button, Form, Input, Space, message, Typography, Card, Upload} from 'antd';
import { isCompany } from "@/utils/accounts";
import { PaperClipOutlined, SendOutlined, UploadOutlined } from "@ant-design/icons";

export default async function NewProfileForm({messages, styles, isCompany}: {messages: any, styles: any, isCompany: boolean}) {
    const msgs = await getMessages(messages.lang);


    const onFinish = async (values: any) => {
     /*   const res = await fetch("/api/profiles/new", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: values.name,
                address: values.address,
                vat: values.vat,
                bio: values.bio,
                profilePicture: values.profilePicture,
                isCompany: true
            })
        });
        const data = await res.json();
        if (res.status === 200) {
            message.success(msgs["profile-created-successfully"]);
        } else {
            message.error(msgs["error-creating-profile"] + " " + data.error);
        }
*/

    

      

        
    };


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
            name: "vat",
            rules: [{ required: true, message: msgs["error-vat-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-profile-picture-label"]}</span>,
            name: "profilePicture",
            rules: [{ required: true, message: msgs["error-profile-picture-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-bio-label"]}</span>,
            name: "bio",
            rules: [{ required: true, message: msgs["error-bio-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-website-label"]}</span>,
            name: "website",
            rules: [{ required: true, message: msgs["error-website-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-sector-label"]}</span>,
            name: "sector",
            rules: [{ required: true, message: msgs["error-sector-not-provided"] }]
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
            rules: [{ required: true, message: msgs["error-bio-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["user-card-address-label"]}</span>,
            name: "address",
            rules: [{ required: true, message: msgs["error-address-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["user-card-profile-picture-label"]}</span>,
            name: "profilePicture",
            rules: [{ required: true, message: msgs["error-profile-picture-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["user-card-birthday-label"]}</span>,
            name: "birthDate",
            rules: [{ required: true, message: msgs["error-birthdate-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["user-card-cv-label"]}</span>,
            name: "cv",
            rules: [{ required: true, message: msgs["error-cv-not-provided"] }]
        },
        {
            label: <span className={styles.formLabel}>{msgs["user-card-sector-label"]}</span>,
            name: "sector",
            rules: [{ required: true, message: msgs["error-sector-not-provided"] }]
        },
    ];

    return (
        <Card className={styles.formNewProfile}>
            <Form
                name="create-profile"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                initialValues={{ remember: true }}
                autoComplete="off"
                className={styles.form}
                onFinish={onFinish}
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
    );
}