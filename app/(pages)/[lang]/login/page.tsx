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
import { SpidButton, CieButton, EidasButton } from "@/components/id-buttons";
import { getMessages } from "@/utils/systemMessage";
import Image from "next/image";
import logo from "@/public/logo.svg";
import styles from "./login.module.css";

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const LogInForm = ({ messages }: { messages: any }) => (
  <Form name="login" initialValues={{ remember: true }} layout="vertical">
    <Form.Item
      name="username"
      rules={[
        {
          message:
            messages["login-username-message"] || "Please input your Username!",
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
          message:
            messages["login-password-message"] || "Please input your Password!",
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
);

export default function LogIn({ params }: any) {
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
            className={styles.loginFormContainer}
            title={messages["login-title"]}
            bordered={false}
          >
            <Paragraph className={styles.loginSubtitle} type="secondary">
              {messages["login-subtitle"]}
            </Paragraph>
            <LogInForm messages={messages} />
            <Space direction="vertical" style={{ width: "100%" }}>
              <SpidButton />
              <CieButton />
              <EidasButton />
            </Space>
          </Card>
        </Content>
      </Skeleton>
    </Layout>
  );
}
