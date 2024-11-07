import { Layout, Row, Col, Card, Typography, Avatar, Input } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { getMessages } from "@/utils/systemMessage";
import styles from "./dashboard.module.css";
import Sidebar from "@/components/dashboard/Siderbar";
import { Header, Sider, Content, Footer } from "@/components/Layout";
import Search from "antd/es/input/Search";
export default async function DashboardLayout({ children, params }: any) {
  const messages = await getMessages((await params).lang);
  return (
    <Layout className={styles.dashboard}>
      <Sider width="25%" className={styles.sidebar}>
        <Sidebar params={params} />
      </Sider>
      <Layout>
        <Header className={styles.header}>
          <div className={styles.logo}>
            <img src="/logo.svg" alt="Logo" />
          </div>
          <Content className={styles.search}>
            <Search placeholder={messages["dashboard-search"]} />
          </Content>
        </Header>

        <Content className={styles.mainContent}>{children}</Content>

        <Footer className={styles.footer}>{messages["landing-footer-description"]}</Footer>
      </Layout>
    </Layout>
  );
}
