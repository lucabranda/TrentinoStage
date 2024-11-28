import {
  Layout,
  Card,
  Row,
  Col,
  Menu,
  Drawer,
  Typography,
  Skeleton,
  Space,
} from "antd";
import {
  DesktopOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  InboxOutlined,
  UserAddOutlined,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";
import logo from "@/public/logo.svg";
import { Link } from "@/components/Anchor";
import { siteConfig } from "@/utils/config";
import { getMessages } from "@/utils/systemMessage";
import styles from "./page.module.css";
import {
  PrimaryButton,
  DefaultButton,
  DashedButton,
  LinkButton,
} from "@/components/buttons/Buttons";
import { Header, Footer, Content } from "@/components/Layout/Layout";
import { Title, Paragraph } from "@/components/Typography";
import HeaderHome from "@/components/HeaderHome";

export default async function Home({ params }: any) {
  const messages = await getMessages((await params).lang);

  return (
    <Layout className={styles.page}>
      <HeaderHome messages={messages} logo={logo} styles={styles} />

      <Content className={styles.main}>
        <section id="hero" className={styles.hero}>
          <img
            src={logo.src}
            alt="Trentino Stage"
            className={styles.heroLogo}
          />
          <Paragraph className={styles.heroSubtitle}>
            {messages["landing-paragraph-1"]}
          </Paragraph>
          <PrimaryButton href="/dashboard/user" className={styles.ctaButton}>
            <UserOutlined />
            {messages["landing-button-dashboard-user"]}
          </PrimaryButton>
          <DefaultButton href="/dashboard/company" className={styles.ctaButton}>
              <RocketOutlined />
              {messages["landing-button-dashboard-company"]}
           </DefaultButton>
         
        </section>

        <hr className={styles.hr}></hr>
        <section id="services" className={styles.services}>
          <Title level={2}>{messages["landing-title-services"]}</Title>
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
        <section id="join" className={styles.cta}>
          <Title level={3}>{messages["landing-title-signup"]}</Title>
          <Paragraph>{messages["landing-signup-description"]}</Paragraph>
          <Space
            style={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <PrimaryButton href="/signup" className={styles.ctaButton}>
              <UserAddOutlined />
              {messages["landing-button-signup-user"]}
            </PrimaryButton>
            <DefaultButton href="/signup/company" className={styles.ctaButton}>
              <RocketOutlined />
              {messages["landing-button-signup-company"]}
            </DefaultButton>
          </Space>
        </section>
      </Content>

      <Footer className={styles.footer}>
        <img src={logo.src} alt="Trentino Stage" className={styles.logo} />
        <div className={styles.footerContent}>
          <Title level={4}>{messages["landing-footer-title"]}</Title>
          <Paragraph>{messages["landing-footer-description"]}</Paragraph>
          <Link href="/about" title={undefined}>
            {messages["footer-link-about"]}
          </Link>
          <Link href="/contact" title={undefined}>
            {messages["footer-link-contact"]}
          </Link>
        </div>
      </Footer>
    </Layout>
  );
}
