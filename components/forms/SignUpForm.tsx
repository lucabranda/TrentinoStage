"use client";

import React, { useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, Space, message, Typography } from "antd";
import { useRouter } from "next/navigation"; // For redirecting in Next.js

export default function SignUpForm({ messages }: { messages: any }) {
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter(); // Next.js router for redirection
  const [messageApi, contextHolder] = message.useMessage(); // Ant Design message API

  // Handle form submission
  const handleSubmit = async (values: any) => {
    const { email, password, confirm } = values;

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
      formData.append("role", "user");
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
  };

  return (
    <>
      {contextHolder}
      <Form
        name="signup"
        initialValues={{ remember: true }}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              type: "email",
              message:
                messages["signup-email-message"] ||
                "Please input your Email!",
            },
          ]}
          label={<span>{messages["signup-email-label"]}</span>}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={messages["signup-email-placeholder"] || "Email"}
            type="email"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message:
                messages["signup-password-message"] ||
                "Please input your Password!",
            },
          ]}
          label={<span>{messages["signup-password-label"]}</span>}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={messages["signup-password-placeholder"] || "Password"}
          />
        </Form.Item>
        <Form.Item
          name="confirm"
          rules={[
            {
              required: true,
              message:
                messages["signup-confirm-message"] ||
                "Please confirm your Password!",
            },
          ]}
          label={<span>{messages["signup-confirm-label"]}</span>}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={
              messages["signup-confirm-placeholder"] || "Confirm Password"
            }
          />
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
          <Typography.Link href="/signup/company">
            {messages["signup-button-signup-company"]}
          </Typography.Link>
        </Form.Item>
      </Form>
    </>
  );
}
