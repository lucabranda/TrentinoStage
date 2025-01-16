import { getProfileId, isCompany } from "@/utils/accounts";
import {checkSessionToken, isLoggedIn} from "@/utils/session";
import {redirect} from 'next/navigation';
import { getMessages } from "@/utils/systemMessage";
import NewProfileForm from "@/components/forms/NewProfileForm";
import styles from "./createProfile.module.css";
import { Layout, Skeleton, Card } from "antd";
import { Header, Content } from "@/components/Layout/Layout";
import Image from "next/image";
import logo from "@/public/logo.svg";

export default async function CreateProfile({ params }: any) {
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
              <NewProfileForm messages={msgs} />
            </Card>
          </Content>
        </Skeleton>
      </Layout>
    )
}
