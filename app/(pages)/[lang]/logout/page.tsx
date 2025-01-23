"use client";
import { removeSessionToken } from "@/utils/cookie";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { Spin } from "antd";

export default function Logout() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const logout = async () => {
            await removeSessionToken();
            redirect("/login");
        };
        logout().finally(() => setLoading(false));
    }, []);

    return (<Spin size="large" tip="Logging out..." spinning={loading} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}/>);
}