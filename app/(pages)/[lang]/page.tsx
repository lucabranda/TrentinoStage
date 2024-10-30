import Image from "next/image";
import styles from "./page.module.css";
import {Button} from "antd";
import { getMessages } from "@/utils/systemMessage";
import { Divider, Typography } from 'antd';
import { Title, Paragraph, Text, Link } from "@/components/typography";
import { siteConfig } from "@/utils/config";

export default async function Home({ params } : any ) {

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Typography>
          <Title>{siteConfig.name}</Title>

          <Paragraph>
            {getMessages((await params).lang)["landing-paragraph-1"]}
          </Paragraph>
        </Typography>

        <Divider/>


        <Button type="primary">{getMessages((await params).lang)["landing-button-login"]}</Button>
      </main>
      <footer className={styles.footer}>

      </footer>
    </div>
  );
}
