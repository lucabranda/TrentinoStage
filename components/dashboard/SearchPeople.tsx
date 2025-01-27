"use client"
import { useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Input, Button, List, Skeleton, Card } from "antd";

export interface Profile {
    id: string;
    name: string;
    surname: string;
    email: string;
    bio: string;
    profilePicture: string;
}

export default function SearchPeople({session, id, messages, styles}: any) {
    const [profilesSource, setProfilesSource] = useState<Profile[]>([]);
   // const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

    /*const handleSearch = async (searchTerm: string) => {
    
    };*/

    const handleSelectProfile = (profile: Profile) => {
        setSelectedProfile(profile);
    };

    return(
        <div className={styles.searchPeopleContainer}>
            <h1>{messages["dashboard-search-people"]}</h1>
            <Input
                placeholder={messages["dashboard-search"] || "Search"}
                style={{ width: 200 }}
               // value={searchTerm}
               // onChange={(e) => setSearchTerm(e.target.value)}
                //onPressEnter={() => handleSearch(searchTerm)}
            />
            <Button type="primary"  style={{ marginLeft: 8 }} onClick={() => {}/*handleSearch(searchTerm)*/}>
            {messages["dashboard-search"] || "Search"} <SearchOutlined/>
            </Button>
            <List
                dataSource={profilesSource}
                renderItem={(profile) => (
                    <List.Item onClick={() => handleSelectProfile(profile)}>
                        {profile.name} {profile.surname} ({profile.id})
                    </List.Item>
                )}
            />
            {selectedProfile && (
                <Card title={selectedProfile.name} style={{ marginTop: 16 }}>
                    <p>{selectedProfile.email}</p>
                    <p>{selectedProfile.bio}</p>
                    <img src={selectedProfile.profilePicture} alt="profile picture" />
                </Card>
            )}
        </div>
    );
}