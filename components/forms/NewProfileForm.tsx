"use client";
import { isLoggedIn, checkSessionToken } from "@/utils/session";
import {getMessages} from "@/utils/systemMessage";
import {Button, Form, Input, Space, message, Typography} from 'antd';
import {useRouter} from 'next/navigation';
import React, {useState} from 'react';
import {  isCompany } from "@/utils/accounts";
export default async function NewProfileForm({messages}: {messages: any}) {
    const msgs = await getMessages(messages.lang);
    const [loading, setLoading] = useState(false); // Loading state
    const router = useRouter(); // Next.js router for redirection
    const [messageApi, contextHolder] = message.useMessage(); // Ant Design message API
    const handleCreateProfile = async (values: any) => {
        try {
            setLoading(true);

            const response = await fetch("/api/profiles/new", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({  ...values }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error.");
            }

            const data = await response.json();
            if (data.token) {
                messageApi.success(data.message || "Profile created!");

                router.push("/dashboard");
            } else {
                throw new Error("Error creating profile.");
            }
        } catch (error: any) {
            messageApi.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {contextHolder}
            <Form
                name="create-profile"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                initialValues={{ remember: true }}
                onFinish={handleCreateProfile}
                autoComplete="off"
            >
                <Form.Item
                    label={msgs["user-card-name-label"]}
                    name="name"
                    rules={[{ required: true, message: msgs["error-name-not-provided"] }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label={msgs["user-card-surname-label"]}
                    name="surname"
                    rules={[{ required: true, message: msgs["error-surname-not-provided"] }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label={msgs["user-card-bio-label"]}
                    name="bio"
                    rules={[{ required: true, message: msgs["error-bio-not-provided"] }]}
                >
                    <Input.TextArea />
                </Form.Item>

                <Form.Item
                    label={msgs["user-card-country-label"]}
                    name="country"
                    rules={[{ required: true, message: msgs["error-country-not-provided"] }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label={msgs["user-card-region-label"]}
                    name="region"
                    rules={[{ required: true, message: msgs["error-region-not-provided"] }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label={msgs["user-card-city-label"]}
                    name="city"
                    rules={[{ required: true, message: msgs["error-city-not-provided"] }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label={msgs["user-card-postalCode-label"]}
                    name="postalCode"
                    rules={[{ required: true, message: msgs["error-postalCode-not-provided"] }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label={msgs["user-card-street-label"]}
                    name="street"
                    rules={[{ required: true, message: msgs["error-street-not-provided"] }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label={msgs["user-card-address-label"]}
                    name="address"
                    rules={[{ required: true, message: msgs["error-address-not-provided"] }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label={msgs["user-card-website-label"]}
                    name="website"
                    rules={[{ required: true, message: msgs["error-website-not-provided"] }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label={msgs["user-card-sector-label"]}
                    name="sector"
                    rules={[{ required: true, message: msgs["error-sector-not-provided"] }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label={msgs["user-card-vat-label"]}
                    name="vat"
                    rules={[{ required: true, message: msgs["error-vat-not-provided"] }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                        {msgs["user-card-submit-button"]}
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
}