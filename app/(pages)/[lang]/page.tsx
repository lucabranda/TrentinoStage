"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Layout,
  Button,
  Card,
  Row,
  Col,
  Menu,
  Drawer,
  Typography,
  Skeleton,
} from "antd";
import {
  DesktopOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  InboxOutlined,
  UserAddOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import logo from "@/public/logo.svg";
import { Link } from "@/components/anchor";
import { siteConfig } from "@/utils/config";
import { getMessages } from "@/utils/systemMessage";
import styles from "./page.module.css";

export default function Home(params : any) {
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const msgs = await getMessages(params.lang);
      setMessages(msgs);
      setLoading(false);
    };
    fetchMessages();

    const handleResize = () => setIsMobile(window.innerWidth < 630);
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [params.lang]);

 ;
  const menuItems = [
    {
      key: "hero",
      icon: <HomeOutlined />,
      label: (
        <Link href="#hero" title={undefined}>
          {messages["landing-nav-1"]}
        </Link>
      ),
    },
    {
      key: "services",
      icon: <InboxOutlined />,
      label: (
        <Link href="#services" title={undefined}>
          {messages["landing-nav-2"]}
        </Link>
      ),
    },
    {
      key: "join",
      icon: <UserAddOutlined />,
      label: (
        <Link href="#join" title={undefined}>
          {messages["landing-nav-3"]}
        </Link>
      ),
    },
  ];

  return (
    <Skeleton active loading={loading} paragraph={{ rows: 4 }}>
      <Layout className={styles.page}>
        <Layout.Header className={styles.header}>
          <img src={logo.src} alt="logo" className={styles.logo} />
          {isMobile ? (
            <>
              <Button
                icon={<MenuOutlined />}
                onClick={() => setDrawerVisible(true)}
              />
              <Drawer
                title="Menu"
                placement="right"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
              >
                <Menu
                  mode="vertical"
                  items={menuItems}
                  onClick={() => setDrawerVisible(false)}
                />
              </Drawer>
            </>
          ) : (
            <>
              <Menu  mode="horizontal" items={menuItems} className={styles.menu} />
              <Button type="default" href="/login" className={styles.loginButton}>{messages["landing-button-login"]}</Button>
            </>
          )}
        </Layout.Header>

        <Layout.Content className={styles.main}>
          <section id="hero" className={styles.hero}>
            <Typography.Title className={styles.heroTitle}>
              {siteConfig.name}
            </Typography.Title>
            <Typography.Paragraph className={styles.heroSubtitle}>
              {messages["landing-paragraph-1"]}
            </Typography.Paragraph>
            <Button
              type="primary"
              size="large"
              href="/login"
              className={styles.ctaButton}
            >
              {messages["landing-button-login"]}
            </Button>
          </section>

          <hr className={styles.hr}></hr>
          <section id="services" className={styles.services} >
            <Typography.Title level={2}>
              {messages["landing-title-services"]}
            </Typography.Title>
            <Row gutter={24} justify="center">
              {[
                {
                  icon: <DesktopOutlined />,
                  title: messages["landing-service-1-title"],
                  desc: messages["landing-service-1-description"],
                },
                {
                  icon: <RocketOutlined />,
                  title: messages["landing-service-2-title"],
                  desc: messages["landing-service-2-description"],
                },
                {
                  icon: <CheckCircleOutlined />,
                  title: messages["landing-service-3-title"],
                  desc: messages["landing-service-3-description"],
                },
              ].map((service, index) => (
                <Col key={index} xs={24} sm={12} md={8}>
                  <Card
                    title={service.title}
                    bordered={false}
                    hoverable
                    className={styles.card}
                  >
                    {service.icon}
                    <Typography.Paragraph>{service.desc}</Typography.Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </section>
          
          <hr className={styles.hr}></hr>
          <section id="join" className={styles.cta} >
            <Typography.Title level={3}>
              {messages["landing-title-signup"]}
            </Typography.Title>
            <Typography.Paragraph>
              {messages["landing-signup-description"]}
            </Typography.Paragraph>
            <Button
              type="primary"
              size="large"
              href="/signup"
              className={styles.ctaButton}
            >
              {messages["landing-button-signup"]}
            </Button>
          </section>
        </Layout.Content>

        <Layout.Footer className={styles.footer}>
          <Typography.Title level={4}>
            {messages["landing-footer-title"]}
          </Typography.Title>
          <Typography.Paragraph>
            {messages["landing-footer-description"]}
          </Typography.Paragraph>
          <div>
            <Link href="/about" title={undefined}>
              {messages["footer-link-about"]}
            </Link>{" "}
            |{" "}
            <Link href="/contact" title={undefined}>
              {messages["footer-link-contact"]}
            </Link>
          </div>
        </Layout.Footer>
      </Layout>
    </Skeleton>
  );
}


