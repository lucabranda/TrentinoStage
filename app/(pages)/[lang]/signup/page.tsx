"use client";

import React, { useEffect, useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Layout,
  Typography,
  Space,
  Card,
  Skeleton,
} from "antd";
import { getMessages } from "@/utils/systemMessage";
import Image from "next/image";
import logo from "@/public/logo.svg";
import styles from "./signup.module.css";

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const SignUpForm = ({ messages }: { messages: any }) => (
  <Form name="signup" layout="vertical">
    <Form.Item
      name="username"
      rules={[
        {
          message:
            messages["signup-username-message"] || "Please input your Username!",
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
        <Button
          type="primary"
          htmlType="submit"
          style={{ flexGrow: 1, marginRight: 8 }}
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
);

export default function SignUp(params: any) {
  const [messages, setMessages] = useState<any>({});

  useEffect(() => {
    (async () => {
      const msgs = getMessages((await params).lang);
      setMessages(msgs);
    })();
  }, [params]);

  return (
    <Layout className={styles.layout}>
      <Skeleton active loading={Object.keys(messages).length === 0}>
        <Header className={styles.header}>
        <a href="/">
            <div className={styles.logo}>
              <Image
                src={logo}
                alt="logo"
                width={120}
                height={50}
                style={{ filter: "invert(1)" }}
              />
            </div>
          </a>
        </Header>
        <Content className={styles.content}>
          <Card
            className={styles.signupFormContainer}
            title={messages["signup-title"]}
            bordered={false}
          >
            <Paragraph className={styles.signupSubtitle} type="secondary">
              {messages["signup-subtitle"]}
            </Paragraph>
            <SignUpForm messages={messages} />
          </Card>
        </Content>
      </Skeleton>
    </Layout>
  );
}


