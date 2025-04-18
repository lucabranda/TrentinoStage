// components/SignUpForm.tsx (Client Component)
"use client";

import React, {useState} from "react";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {Form, Input, message, Space, Typography} from "antd";
import {Button} from "antd";
import {useRouter} from "next/navigation";

export default function  SignUpFormCompany ({messages}: { messages: any }) {
    const [loading, setLoading] = useState(false); // Loading state
    const router = useRouter(); // Next.js router for redirection
    const [messageApi, contextHolder] = message.useMessage(); // Ant Design message API

    // Handle form submission
    const handleSubmit = async (values: any) => {
        const { email, password, confirm, token } = values;

        // Verify password match
        if (password !== confirm) {
            messageApi.error(
                messages["signup-password-mismatch"] || "Passwords do not match."
            );
            return;
        }

        try {
            setLoading(true); // Start loading state

            // Create FormData for the request
            const formData = new FormData();
            formData.append("email", email); // Map email to expected server field
            formData.append("password", password);
           if(token !== undefined){
                formData.append("token", token)
                formData.append("role", "company-employee");
            }else{
                formData.append("role", "company-manager")
            }
            // Send POST request to /api/accounts/register
            const response = await fetch("/api/accounts/register", {
                method: "POST",
                body: formData, // Use FormData
            });

            if (!response.ok) {
                const errorData = await response.json();
                messageApi.error(
                    errorData.error || messages["signup-error"] || "Registration error."
                );
                return;
            }

            router.push("/dashboard");

        } catch (error: any) {
            messageApi.error(
                error.message || messages["signup-error"] || "Registration error."
            );
        } finally {
            setLoading(false); // End loading state
        }
    }
    return (
    <Form name="signup" layout="vertical"  onFinish={handleSubmit}>
        <Form.Item
            name="email"
            rules={[
                {
                    message:
                        messages["signup-company-message"] || "Please input your Username!",
                },
            ]}
            label={<span>{messages["signup-company-label"]}</span>}
        >
            <Input
                prefix={<UserOutlined/>}
                placeholder={messages["signup-company-placeholder"] || "Username"}
            />
        </Form.Item>
        <Form.Item
            name="password"
            rules={[
                {
                    message:
                        messages["signup-password-message"] ||
                        "Please input your Password!",
                },
            ]}
            label={<span>{messages["signup-password-label"]}</span>}
        >
            <Input.Password
                prefix={<LockOutlined/>}
                placeholder={messages["signup-password-placeholder"] || "Password"}
            />
        </Form.Item>
        <Form.Item
            name="confirm"
            rules={[
                {
                    message:
                        messages["signup-confirm-message"] ||
                        "Please input your Password again!",
                },
            ]}
            label={<span>{messages["signup-confirm-label"]}</span>}
        >
            <Input.Password
                prefix={<LockOutlined/>}
                placeholder={
                    messages["signup-confirm-placeholder"] || "Confirm Password"
                }
            />
        </Form.Item>
        <Form.Item
            name="token"
            label={<span>{messages["signup-invite-code"]}</span>}
        >
            <Input
                prefix={<></>}
                placeholder={messages["signup-invite-code-placeholder"] || "Invite Code"}/>


        </Form.Item>
       <Form.Item>
                <Space
                    style={{ display: "flex", justifyContent: "center", width: "100%" }}
                >
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{ flexGrow: 1, marginRight: 8 }}
                        loading={loading} // Show loading spinner while submitting
                    >
                        {messages["signup-button-signup"]}
                    </Button>
                    <Button
                        type="default"
                        style={{ flexGrow: 1, textAlign: "center" }}
                        href="/login"
                    >
                        {messages["signup-button-login"]}
                    </Button>
                </Space>
            </Form.Item>
        <Form.Item>
            <Typography.Link href="/signup">
                {messages["signup-button-signup-user"]}
            </Typography.Link>
        </Form.Item>
    </Form>
);
}
