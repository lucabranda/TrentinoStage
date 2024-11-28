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
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import styles from "./loginForm.module.css";
import { setSessionToken } from "@/utils/cookie";

interface LogInFormProps {
  messages: Record<string, string>;
}

interface FormValues {
  email: string;
  password: string;
  remember: boolean;
}

export default function LogInForm({ messages }: LogInFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    const { email, password, remember } = values;

    try {
      setLoading(true);

      // Send POST request to /api/session/create
      const response = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || messages["login-error"] || "Login error."
        );
      }

      // Handle success response
      const data = await response.json();
      if (data.token) {
        setSessionToken(data.token, remember);

        messageApi.success(
          data.message || messages["login-success"] || "Login successful!"
        );

        // Redirect to the dashboard
        router.push("/dashboard/user");
      } else {
        throw new Error(messages["login-token-error"] || "Login failed.");
      }
    } catch (error: any) {
      messageApi.error(
        error.message || messages["login-error"] || "Login error."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Form
        name="login"
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
                messages["login-email-message"] || "Please input a valid Email!",
            },
          ]}
          label={messages["login-email-label"] || "Email"}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={messages["login-email-placeholder"] || "Email"}
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message:
                messages["login-password-message"] || "Please input your Password!",
            },
          ]}
          label={messages["login-password-label"] || "Password"}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={messages["login-password-placeholder"] || "Password"}
          />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>{messages["login-remember-me"] || "Remember me"}</Checkbox>
        </Form.Item>

        <Form.Item>
          <Space
            style={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Button
              type="primary"
              htmlType="submit"
              style={{ flexGrow: 1, marginRight: 8 }}
              loading={loading}
            >
              {messages["login-button-login"] || "Log In"}
            </Button>
            <Button
              type="default"
              style={{ flexGrow: 1 }}
              href="/signup"
            >
              {messages["login-button-signup"] || "Sign Up"}
            </Button>
          </Space>
        </Form.Item>

        <Form.Item>
          <Typography.Link href="#" className={styles.loginFormForgot}>
            {messages["login-forgot-password"] || "Forgot password?"}
          </Typography.Link>
        </Form.Item>
      </Form>
    </>
  );
}
