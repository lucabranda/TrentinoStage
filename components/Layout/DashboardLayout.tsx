import { Layout, Menu } from "antd";
import { Header, Sider, Content, Footer } from "./Layout";
import Search from "antd/es/input/Search";
import { getMessages } from "@/utils/systemMessage";
import { HomeOutlined } from "@ant-design/icons";
import logo from '@/public/logo.svg';
import styles from "./dashboard.module.css";
import {Link} from "@/components/Typography";
export default async function DashboardLayout({
  children,
  params,
  itemsSidebar,   // Receive itemsSidebar here
}: {
  children: React.ReactNode;
  params: any;
  itemsSidebar: any; // Define type for itemsSidebar as per the actual data type
}) {
  const messages = await getMessages((await params).locale);

  return (
    <Layout className={styles.dashboard}>
      <Sider width="25%" className={styles.sidebar}>
        <Menu mode="inline" items={itemsSidebar} style={{ height: '100%', borderRight: 0 }} />
        <img src={logo.src} alt="Trentino Stage" className="logo" style={{ height: "50px", filter: "invert(1)" }} />
      </Sider>
      <Layout>
        <Header className={styles.header}>
          <Search className={styles.search} placeholder={messages["dashboard-search"]} />
          <Link href="/" className={styles.homeLink}>
            <HomeOutlined />
          </Link>
        </Header>

        <Content className={styles.mainContent}>{children}</Content>

        <Footer className={styles.footer}>
          {messages["landing-footer-description"]}
        </Footer>
      </Layout>
    </Layout>
  );
}
