"use client";

import React, { useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  Space,
  message,
} from "antd";
import { useRouter } from "next/navigation"; // For redirecting in Next.js
import { setSessionToken } from "@/utils/cookie"; // Import session management utility
import styles from "./signUpForm.module.css";

export default function SignUpForm({ messages }: { messages: any }) {
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter(); // Next.js router for redirection
  const [messageApi, contextHolder] = message.useMessage(); // Ant Design message API

  // Handle form submission
  const handleSubmit = async (values: any) => {
    const { username, password, confirm } = values;

    // Verify password match
    if (password !== confirm) {
      messageApi.error(messages["signup-password-mismatch"] || "Passwords do not match.");
      return;
    }

    // Create FormData for the request
    const formData = new FormData();
    formData.append("email", username); // username is the user's email
    formData.append("password", password);

    try {
      setLoading(true); // Start loading state

      // Send POST request to /api/accounts/register
      const response = await fetch("/api/accounts/register", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        messageApi.error(errorData.error || messages["signup-error"] || "Registration error.");
        return;
      }

      // Handle success response
      const data = await response.json();

      if (data.token) {
        // Save token using the utility function
        setSessionToken(data.token, false); // Default: session cookie (not "remember me")

        // Show success message
        messageApi.success(messages["signup-success"] || "Registration successful!");

        // Redirect to the dashboard
        router.push("/dashboard/user");
      } else {
        messageApi.error(messages["signup-token-error"] || "Registration failed.");
      }

    } catch (error: any) {
      messageApi.error(error.message || messages["signup-error"] || "Registration error.");
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <>
      {contextHolder} {/* Ant Design message holder */}
      <Form name="signup" initialValues={{ remember: true }} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="username"
          rules={[
            {
              required: true,
              message: messages["signup-username-message"] || "Please input your Username!",
            },
          ]}
          label={<span>{messages["signup-username-label"]}</span>}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={messages["signup-username-placeholder"] || "Username"}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: messages["signup-password-message"] || "Please input your Password!",
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
              message: messages["signup-confirm-message"] || "Please confirm your Password!",
            },
          ]}
          label={<span>{messages["signup-confirm-label"]}</span>}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={messages["signup-confirm-placeholder"] || "Confirm Password"}
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
      </Form>
    </>
  );
}