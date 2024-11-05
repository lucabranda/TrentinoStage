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
import { Link } from "@/components/Anchor";
import { siteConfig } from "@/utils/config";
import { getMessages } from "@/utils/systemMessage";
import styles from "./page.module.css";
import {Header, Footer, Content} from "@/components/Layout"
import {Title, Paragraph} from "@/components/Typography"

export default async function Home(params : any) {

  const messages = await getMessages((await params).lang);

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
      <Layout className={styles.page}>
        <Header className={styles.header}>
          <img src={logo.src} alt="logo" className={styles.logo} />
          <Menu  mode="horizontal" items={menuItems} className={styles.menu} />
          <Button type="default" href="/login" className={styles.loginButton}>{messages["landing-button-login"]}</Button>
        </Header>

        <Content className={styles.main}>
          <section id="hero" className={styles.hero}>
            <Title className={styles.heroTitle}>
              {siteConfig.name}
            </Title>
            <Paragraph className={styles.heroSubtitle}>
              {messages["landing-paragraph-1"]}
            </Paragraph>
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
            <Title level={2}>
              {messages["landing-title-services"]}
            </Title>
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
                    <Paragraph>{service.desc}</Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </section>
          
          <hr className={styles.hr}></hr>
          <section id="join" className={styles.cta} >
            <Title level={3}>
              {messages["landing-title-signup"]}
            </Title>
            <Paragraph>
              {messages["landing-signup-description"]}
            </Paragraph>
            <Button
              type="primary"
              size="large"
              href="/signup"
              className={styles.ctaButton}
            >
              {messages["landing-button-signup"]}
            </Button>
          </section>
        </Content>

        <Footer className={styles.footer}>
          <Title level={4}>
            {messages["landing-footer-title"]}
          </Title>
          <Paragraph>
            {messages["landing-footer-description"]}
          </Paragraph>
          <div>
            <Link href="/about" title={undefined}>
              {messages["footer-link-about"]}
            </Link>{" "}
            |{" "}
            <Link href="/contact" title={undefined}>
              {messages["footer-link-contact"]}
            </Link>
          </div>
        </Footer>
      </Layout>
  );
}