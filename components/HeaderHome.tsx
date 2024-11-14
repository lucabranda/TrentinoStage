"use client";
import { useState, useEffect } from "react";
import {  Menu } from "antd";
import { Header } from "./Layout/Layout";
import {
  HomeOutlined,
  InboxOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { LinkButton } from "./buttons/Buttons";
import LanguageSelector from "./buttons/LanguageSelector";

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
}

const SECTION_IDS = ["hero", "services", "join"];

const getActiveSection = (scrollPosition: number): string => {
  for (const id of SECTION_IDS) {
    const section = document.getElementById(id);
    if (
      section &&
      section.offsetTop <= scrollPosition &&
      section.offsetTop + section.offsetHeight > scrollPosition
    ) {
      return id;
    }
  }
  return "hero";
};

export default function HeaderHome({
  messages,
  logo,
  styles,
}: HeaderHomeProps) {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      setActiveSection(getActiveSection(scrollPosition));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  return (
    <Header className={styles.header}>
      <img src={logo.src} alt="logo" className={styles.logo} />
      <Menu
        mode="horizontal"
        selectedKeys={[activeSection]}
        items={menuItems}
        className={styles.menu}
      />
      <div className={styles.headerElementsContainer}>
        <LanguageSelector />
        <LinkButton href="/login" className={styles.loginButton}>
          {messages["landing-button-login"]}
        </LinkButton>
      </div>
    </Header>
  );
}
