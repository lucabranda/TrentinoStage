"use client";
import { useState } from "react";
import { Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { FaTimes } from "react-icons/fa";
import { Sider } from "../Layout/Layout";

export default function SiderDashboard({ itemsSiderbar, styles  }: { itemsSiderbar: any, styles:any  }) {
    const [collapsed, setCollapsed] = useState(false);
    return (
        <Sider
            width="25%"
            className={styles.sider}
            collapsible
            trigger={null}
            collapsed={collapsed}
            onCollapse={(collapsed: boolean | ((prevState: boolean) => boolean)) => setCollapsed(collapsed)}
        >
            <div className={styles.closeButton}>
                <Button onClick={() => setCollapsed(!collapsed)}>{collapsed ? <FaTimes /> : <MenuOutlined />}</Button>
            </div>
            <Menu mode="vertical" items={itemsSiderbar} className={styles.menu} />
        </Sider>
    );
}