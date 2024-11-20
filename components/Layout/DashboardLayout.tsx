import { Layout, Menu } from "antd";
import { Header, Sider, Content, Footer } from "./Layout";
import Search from "antd/es/input/Search";
import { getMessages } from "@/utils/systemMessage";
import { HomeOutlined } from "@ant-design/icons";
import styles from "./dashboard.module.css";
import { Link, Title } from "@/components/Typography";
import LanguageSelector from "@/components/buttons/LanguageSelector";
import logo from "@/public/logo.svg";
export default async function DashboardLayout({
  children,
  params,
  itemsSidebar, // Receive itemsSidebar here
}: {
  children: React.ReactNode;
  params: any;
  itemsSidebar: any; // Define type for itemsSidebar as per the actual data type
}) {
  const messages = await getMessages((await params).locale);

  return (
    <Layout className={styles.dashboard}>
      <Sider width="20%" className={styles.sidebar}>
        <Menu mode="inline" items={itemsSidebar} className={styles.menu} />
        <img src={logo.src} alt="Trentino Stage" className={styles.logo} />
      </Sider>
      <Layout>
        <Header className={styles.header}>
          <Search
            className={styles.search}
            placeholder={messages["dashboard-search"]}
          />
          <LanguageSelector />
          <Link href="/" className={styles.homeLink}>
            <HomeOutlined />
          </Link>
        </Header>

        <Content className={styles.mainContent}>
          <div className={styles.dataContent}>{children}</div>
          <Footer className={styles.footer}>
            {messages["landing-footer-description"]}
          </Footer>
        </Content>
      </Layout>
    </Layout>
  );
}
