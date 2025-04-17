"use client";
import { useState, useEffect } from "react";
import {  Menu } from "antd";
import { Header } from "./Layout/Layout";
import {
  HomeOutlined,
  InboxOutlined,
  MenuOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { LinkButton } from "./buttons/Buttons";
import LanguageSelector from "./buttons/LanguageSelector";
import {removeSessionToken} from "@/utils/cookie";

interface HeaderHomeProps {
  messages: {
    [key: string]: string;
  };
  logo: {
    src: string;
  };
  styles: {
    [key: string]: string;
  };
  isLogged: boolean;
}

const SECTION_IDS = ["hero", "services", "join"];

export default function HeaderHome({
  messages,
  logo,
  styles,
  isLogged
}: HeaderHomeProps) {
  const [activeSection, setActiveSection] = useState("hero");
  useEffect(() => {
    const handleScroll = () => {
      const currentSection = SECTION_IDS.find((id) => {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 80 && rect.bottom >= 80;
        }
        return false;
      });
  
      if (currentSection && currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection]);
  
  const menuItems = [
    {
      key: "hero",
      icon: <HomeOutlined />,
      label: <Link href="#hero">{messages["landing-nav-1"]}</Link>,
    },
    {
      key: "services",
      icon: <InboxOutlined />,
      label: <Link href="#services">{messages["landing-nav-2"]}</Link>,
    },
    {
      key: "join",
      icon: <UserAddOutlined />,
      label: <Link href="#join">{messages["landing-nav-3"]}</Link>,
    },
  ];

  function logout() {
    removeSessionToken();
    window.location.reload();
  }


  return (
    <Header className={styles.header}>
      <img src={logo.src} alt="logo" className={styles.logo} />
      <Menu
        mode="horizontal"
        selectedKeys={[activeSection]}
        items={menuItems}
        className={styles.menu}
        overflowedIndicator={<MenuOutlined />}
      />
      <div className={styles.headerElementsContainer}>
        <LanguageSelector />
        {!isLogged ? (
          <LinkButton href="/login" className={styles.loginButton}>
            {messages["landing-button-login"]}
          </LinkButton>
        ) : (
          <LinkButton onClick={() => logout()} className={styles.loginButton}>
            {messages["landing-button-logout"] || "Logout"}
          </LinkButton>
        )}
      </div>
    </Header>
  );
}
