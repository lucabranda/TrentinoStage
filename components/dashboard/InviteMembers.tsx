"use client"

import {SendOutlined} from "@ant-design/icons";
import {Input, Button, Card} from "antd";
import {ProfilesApi} from "@/api/profilesApi";
import {useState} from "react";

export default function InviteMembers({session, id, messages, styles}: any) {
    const [inviteCode, setInviteCode] = useState<string | undefined>(undefined);

    async function generateInvite() {
        const api = new ProfilesApi();
        setInviteCode((await api.apiProfilesInviteGet(session, "1d", "company-manager"/*TODO: company-employee*/)).body['token']);
    }

    return(
        <div className={styles.searchPeopleContainer}>
            <h1>{messages["dashboard-invite-members"]}</h1>
            <p>{messages["invite-members-info"]}</p>
            <br/>
            <Button type="primary"  style={{ marginLeft: 8 }} onClick={async () => {await generateInvite()}}>
                {messages["invite-members-generate"] || "Invite"} <SendOutlined/>
            </Button>

            <br/><br/>
            {inviteCode && (
                <Card>
                    <p><b>{messages["invite-members-invite-code"]}</b>: <u>{inviteCode}</u></p>
                </Card>
            )}
        </div>
    );
}