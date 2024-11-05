"use client"

import { LockOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Space,
} from "antd";
import styles from "./loginForm.module.css";


export default function LogInForm ({ messages }: { messages: any }) { 
    return (
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
}