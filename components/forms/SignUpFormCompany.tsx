// components/SignUpForm.tsx (Client Component)
"use client";

import React from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Form, Input, Space } from "antd";
import { DefaultButton, LinkButton, PrimaryButton } from "../buttons/Buttons";

const SignUpFormCompany = ({ messages }: { messages: any }) => (
  <Form name="signup" layout="vertical">
    <Form.Item
      name="username"
      rules={[
        {
          message:
            messages["signup-company-message"] || "Please input your Username!",
        },
      ]}
      label={<span>{messages["signup-company-label"]}</span>}
    >
      <Input
        prefix={<UserOutlined />}
        placeholder={messages["signup-company-placeholder"] || "Username"}
      />
    </Form.Item>
    <Form.Item
      name="password"
      rules={[
        {
          message:
            messages["signup-password-message"] || "Please input your Password!",
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
          message:
            messages["signup-confirm-message"] || "Please input your Password again!",
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
        <PrimaryButton
          htmlType="submit"
          style={{ flexGrow: 1, marginRight: 8 }}
        >
          {messages["signup-button-signup"]}
        </PrimaryButton>
        <DefaultButton
          style={{ flexGrow: 1, textAlign: "center" }}
          href="/login"
        >
          {messages["signup-button-login"]}
        </DefaultButton>
      </Space>

      <LinkButton
        href="/signup"
        style={{
          display: "block",
          margin: "24px auto 0",
          textAlign: "center",
          width: "100%",
        }}
      >
        {messages["signup-button-signup-user"]}
      </LinkButton>
    </Form.Item>
  </Form>
);

export default SignUpFormCompany;

