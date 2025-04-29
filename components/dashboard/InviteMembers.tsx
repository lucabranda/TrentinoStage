"use client"

import {SendOutlined} from "@ant-design/icons";
import {Input, Button, Card} from "antd";
import {useState} from "react";

export default function InviteMembers({session, messages}: any) {
    const [inviteCode, setInviteCode] = useState<string | undefined>(undefined);

    async function generateInvite() {
        try {
            const response = await fetch(`/api/invites?token=${encodeURIComponent(session)}&duration=1d&role=company-manager`, {
                method: "GET",
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(errorData);
                throw new Error(errorData.error);
            }

            const data = await response.json();
            setInviteCode(data.token);
        } catch (error) {
            console.error("Errore durante la generazione dell'invito:", error);
        }
    }

    return (
        <>
            <h1>{messages["dashboard-invite-members"]}</h1>
            <p>{messages["invite-members-info"]}</p>
            <br />
            <Button
                type="primary"
                style={{ marginLeft: 8 }}
                onClick={async () => {
                    await generateInvite();
                }}
            >
                {messages["invite-members-generate"] || "Invite"} <SendOutlined />
            </Button>

            <br /><br />
            {inviteCode && (
                <Card>
                    <p>
                        <b>{messages["invite-members-invite-code"]}</b>: <u>{inviteCode}</u>
                    </p>
                </Card>
            )}
        </>
    );
}