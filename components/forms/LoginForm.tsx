"use client";

import React, { useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Space,
  message,
} from "antd";
import { useRouter } from "next/navigation";  // For redirecting in Next.js
import styles from "./loginForm.module.css";
import { setSessionToken } from "@/utils/cookie";  // Import utility

export default function LogInForm({ messages }: { messages: any }) {
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter(); // Next.js router for redirection
  const [messageApi, contextHolder] = message.useMessage(); // Ant Design message API

  // Handle form submission
  const handleSubmit = async (values: any) => {
    const { username, password, remember } = values;

    // Create FormData for the request
    const formData = new FormData();
    formData.append("email", username); // username is the user's email
    formData.append("password", password);

    try {
      setLoading(true); // Start loading state

      // Send POST request to /api/session/create
      const response = await fetch("/api/session/create", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        messageApi.error(errorData.error || messages["login-error"] || "Login error.");
        return;
      }

      // Handle success response
      const data = await response.json();

      if (data.token) {
        // Save token using the utility function
        setSessionToken(data.token, remember);

        // Show success message
        messageApi.success(data.message || messages["login-success"] || "Login successful!");

        // Redirect to dashboard
        router.push("/dashboard/user");
      } else {
        messageApi.error(messages["login-token-error"] || "Login failed.");
      }

    } catch (error: any) {
      messageApi.error(error.message || messages["login-error"] || "Login error.");
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <>
      {contextHolder} {/* Ant Design message holder */}
      <Form name="login" initialValues={{ remember: true }} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="username"
          rules={[
            {
              required: true,
              message: messages["login-username-message"] || "Please input your Username!",
            },
          ]}
          label={<span>{messages["login-username-label"]}</span>}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={messages["login-username-placeholder"] || "Username"}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: messages["login-password-message"] || "Please input your Password!",
            },
          ]}
          label={<span>{messages["login-password-label"]}</span>}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={messages["login-password-placeholder"] || "Password"}
          />
        </Form.Item>
        <a href="#" className={styles.loginFormForgot}>
          {messages["login-forgot-password"]}
        </a>
        <Form.Item>
          <Checkbox name="remember">{messages["login-remember-me"]}</Checkbox>
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
              {messages["login-button-login"]}
            </Button>
            <Button
              type="default"
              style={{ flexGrow: 1, textAlign: "center" }}
              href="/signup"
            >
              {messages["login-button-signup"]}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </>
  );
}