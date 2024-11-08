import { LockOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Form,
  Layout,
  Typography,
  Input,
  Space,
  Card,
  Skeleton,
} from "antd";
import { Header, Content } from "@/components/Layout";
import { Title, Paragraph } from "@/components/Typography";
import { DigitalIdentityButtons } from "@/components/buttons/IdButtons";
import { getMessages } from "@/utils/systemMessage";
import Image from "next/image";
import logo from "@/public/logo.svg";
import styles from "./login.module.css";
import LogInForm from "@/components/forms/LoginForm";

export default async function LogIn({ params }: any) {
  const msgs = await getMessages((await params).lang);

  return (
    <Layout className={styles.layout}>
      <Skeleton active loading={msgs["control"] == "control"}>
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
            title={msgs["login-title"]}
            bordered={false}
          >
            <LogInForm messages={msgs} />
            <Space direction="vertical" style={{ width: "100%" }}>
              <DigitalIdentityButtons lang={(await params).lang} />
            </Space>
          </Card>
        </Content>
      </Skeleton>
    </Layout>
  );
}
