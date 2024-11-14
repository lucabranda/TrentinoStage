// app/signup/page.tsx (Server Component)
import React from "react";
import { getMessages } from "@/utils/systemMessage"; // Funzione per caricare i messaggi
import { Suspense } from "react"; // React Suspense per la gestione del caricamento
import { Skeleton, Layout, Card, Typography } from "antd";
import styles from "./signup.module.css"; // Stili della pagina
import Image from "next/image";
import logo from "@/public/logo.svg";
import { Header, Content } from "@/components/Layout/Layout";
import { Paragraph } from "@/components/Typography";
import SignUpForm from "@/components/forms/SignUpForm";

// Server Component: Pagina di signup con la logica di caricamento dei dati
export default async function SignUp({ params }: any) {
  const messages = await getMessages((await params).lang); // Carica i messaggi in modo sincrono

  return (
    <Layout className={styles.layout}>
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
          className={styles.signupFormContainer}
          title={messages["signup-title"]}
          bordered={false}
        >
          <Suspense fallback={<Skeleton active loading={true} />}>
            <SignUpForm messages={messages} />
          </Suspense>
        </Card>
      </Content>
    </Layout>
  );
}
