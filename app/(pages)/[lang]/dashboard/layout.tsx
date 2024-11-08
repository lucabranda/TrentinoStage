import { Layout, Row, Col, Card, Typography, Avatar, Input } from "antd";
import styles from "./dashboard.module.css";
import Sidebar from "@/components/dashboard/Siderbar";
import { Header, Sider, Content, Footer } from "@/components/Layout";
import Search from "antd/es/input/Search";
import {getMessages} from "@/utils/systemMessage"
export default async function DashboardLayout({ children, params }: { children: any, params: any}) {

  const messages = await getMessages((await params).locale);

  return (
    <Layout className={styles.dashboard}>
      <Sider width="25%" className={styles.sidebar}>
        <Sidebar messages={messages}/>
      </Sider>
      <Layout>
        <Header className={styles.header}>
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
