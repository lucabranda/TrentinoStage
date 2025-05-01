import React, { useState, useEffect } from 'react';
import { Card, List, Button, Space, Typography, Select, InputNumber, Avatar, Spin } from 'antd';
import { CheckCircleOutlined, CheckOutlined, CloseCircleOutlined, CloseOutlined, DeleteOutlined, LoadingOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { DashedButton, LinkButton, PrimaryButton } from '../buttons/Buttons';
import { Paragraph, Title } from '../Typography';
import ProfileCard, {ProfileCompanyData, ProfileUserData} from "@/components/dashboard/ProfileCard";
const {Item} = List;
const { Text } = Typography;

interface ApplicationSectionProps {
    session: string;
    id: string;
    messages: any;
}

interface Application {
    item: {
        title: string,
        description: string,
        sector: string,
        maxTime: number,
        minTime: number,
        location: {
            country: string,
            region: string,
            city: string,
        },
        _id: string,
        issuer_id: string,
        weekly_hours: number,
        applied_users: {
            _id: string;
            application_time: string;
            user_id: string;
        }[],
        chosen_user: string,
        creation_time: string
    };
    messages: any;
    isCompany: boolean;
    token: string;
    id: string;
}

const handleAccept = async (session: string, company_id: string, _id: string, issuer_id: string ) => {

}

const handleReject = async (session: string, company_id: string, _id: string, issuer_id: string ) => {

}
const handleDelete = (session: string, id: string ) => {

}

function useUserProfileData(token: string, id: string, isACompany: boolean) {
    const [values, setValues] = useState<ProfileUserData | ProfileCompanyData>()

    useEffect(() => {
        const fetchProfileData = async () => {
          const res = await fetch(`/api/profiles/get?token=${token}&profileId=${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
          });

          if (!res.ok) {
            console.log(res);
            throw new Error('Failed to fetch profile data');
          }

          const data = await res.json();
          const values = (isACompany ? {
                name: data.name,
                address: {
                    address: data.address,
                    city: data.city,
                    region: data.region,
                    country: data.country,
                    postal_code: data.postal_code,
                    street: data.street
                },
                sector: data.sector,
                website: data.website,
                partitaIva: data.partitaIva
            } : {
                name: data.name,
                surname: data.surname,
                bio: data.bio,
                birth_date: data.birth_date,
                address: {
                    address: data.address,
                    city: data.city,
                    region: data.region,
                    country: data.country,
                    postal_code: data.postal_code,
                    street: data.street
                },
                sector: data.sector,
                website: data.website
            });
            setValues(values as ProfileCompanyData | ProfileUserData);
        };

        if (token && id) {
            fetchProfileData();
        }
    }, [token, id]);

    return values;

}

const UserDetailsRow = ({user, token, messages, itemId, issuerId}: {
    user: {
        _id: string;
        application_time: string;
        user_id: string;
    };
    token: string;
    messages: any;
    itemId: string;
    issuerId: string;

}) => {

    const [showProfileCard, setShowProfileCard] = useState(false);
    const profile_data = useUserProfileData(token, user.user_id, false) as ProfileUserData;
    return (
        <>
            <Item style={{display: 'flex', gap: 24, justifyContent: 'space-between'}} id={itemId}>
                <List.Item.Meta
                    key={user._id}
                    title={<Avatar src={user._id}
                                   onClick={() => setShowProfileCard(!showProfileCard)}/>}
                    description={
                        <Space direction="vertical" style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <Text strong>{profile_data?.name}</Text>
                            {/*
                  <Text strong>{user.message}</Text>
                  */}
                            <div style={{display: 'flex', gap: 8}}>
                                <LinkButton
                                    onClick={() => handleAccept(token, issuerId, itemId, user.user_id)}
                                    style={{
                                        border: '1px solid green',
                                        borderColor: 'green',
                                        color: 'green'
                                    }}><CheckOutlined/></LinkButton>
                                <LinkButton
                                    onClick={() => handleReject(token, issuerId, itemId, user.user_id)}
                                    style={{
                                        borderColor: 'red',
                                        border:'1px solid red',
                                        color: 'red'
                                    }}><CloseOutlined/></LinkButton>
                                <PrimaryButton
                                    onClick={()=>setShowProfileCard(!showProfileCard)}
                                >
                                    {messages["dashboard-application-show-user-profile"] || "Show user profile"}
                                </PrimaryButton>

                            </div>
                        </Space>
                    }
                />
            </Item>
            {showProfileCard && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,

                }}
                >

                    <ProfileCard session={token} messages={messages} isCompany={false} isOwner={false} profileData={profile_data} id={user.user_id} closeButton={ (<Button onClick={() => setShowProfileCard(false)}
                                                                                                                                                                           style={{border: 'none'}}><CloseCircleOutlined/></Button>)}/>
                </div>
            )}
        </>
    );
};


const ApplicationCard = ({ item, token, id, messages, isCompany }: Application) => {
    const [showCompleteCard, setShowCompleteCard] = useState(false);
    return (
        <>
            {(isCompany) ? (
               <>
                  <Item style={{display: 'flex', gap: 24, justifyContent: 'space-between'}} id={item._id}>
                      <Title level={4}> {item.title}</Title>
                      <Text type="secondary">{item.applied_users.length} {messages["dashboard-applications"]}</Text>
                  </Item>
                  {item.applied_users.map((user) => (<UserDetailsRow user={user} token={token} messages={messages} itemId={item._id} issuerId={id}  /> ))}
              </>
                ) : (
                    <>
                        <Item style={{display: 'flex', gap: 24, justifyContent: 'space-between'}} id={item._id}>

                        {(item.chosen_user === undefined) ? (
                            <MinusCircleOutlined style={{color: 'gold'}}/>
                        ) : item.chosen_user === item.issuer_id ? (
                            <CheckCircleOutlined style={{color: 'green'}}/>
                        ) : (
                            <CloseCircleOutlined style={{color: 'red'}}/>
                        )}

                        <List.Item.Meta
                            title={<Text strong>{item.title}</Text>}
                            description={
                                <Space direction="vertical" style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>

                                    <Paragraph>
                                        <Text><b> {messages["dashboard-application-description"] || "Description"}: </b></Text>
                                        <Text type="secondary">{item.description}</Text>
                                    </Paragraph>
                                    <Paragraph>
                                        <Text><b> {messages["dashboard-application-sector"] || "Sector"}: </b></Text>
                                        <Text type="secondary">{item.sector}</Text>
                                    </Paragraph>
                                    <Paragraph>
                                        <Text><b> {messages["dashboard-application-location"] || "Location"}: </b></Text>
                                        <Text type="secondary">{item.location?.city}</Text>
                                    </Paragraph>
                                    <Paragraph>
                                        <Text><b> {messages["dashboard-application-time"] || "Time"}: </b></Text>
                                        <Text type="secondary">{item.minTime} - {item.maxTime}</Text>
                                    </Paragraph>

                                    <div style={{display: 'flex', gap: 8}}>
                                        <DashedButton onClick={() => {
                                            handleDelete(token, id)
                                        }} style={{
                                            borderColor: 'red',
                                            color: 'red',
                                            backgroundColor: 'lightcoral'
                                        }}><DeleteOutlined style={{color: 'red'}}/></DashedButton>
                                        <PrimaryButton
                                            onClick={() => setShowCompleteCard(!showCompleteCard)}>{messages["dashboard-show-details"] || "Show details"}</PrimaryButton>
                                    </div>
                                </Space>
                            }
                        />

                    </Item>
                </>
            )}

            {showCompleteCard && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                >
                    <Card
                        style={{
                            width: 800,
                            backgroundColor: 'white',
                            borderRadius: 10,
                            padding: 20,
                        }}
                    >
                        <Space direction="vertical" size="large" style={{width: '100%', display: 'flex'}}>
                            <Space style={{justifyContent: 'space-between', width: '100%', display: 'flex'}}>
                                <Title level={3}>{item.title}</Title>
                                <Button onClick={() => setShowCompleteCard(false)}
                                        style={{border: 'none'}}><CloseCircleOutlined/></Button>
                            </Space>
                            <Paragraph>{item.description}</Paragraph>
                            <List
                                dataSource={[
                                    {label: 'Sector', value: item.sector},
                                    {
                                        label: 'Location',
                                        value: `${item.location?.city}, ${item.location?.region}, ${item.location?.country}`
                                    },
                                    {label: 'Time', value: `${item.minTime} - ${item.maxTime}`},
                                    {label: 'Issuer ID', value: item.issuer_id},
                                    {label: 'Weekly hours', value: item.weekly_hours},
                                    {
                                        label: 'Applied users',
                                        value: item.applied_users?.map((user:{
                                            _id: string,
                                        }) => user._id).join(', ')
                                    },
                                    {label: 'Chosen user', value: item.chosen_user || 'None'},
                                    {label: 'Creation time', value: item.creation_time},

                                ]}
                                renderItem={(item) => (
                                    <List.Item>
                                        <Text strong>{item.label}</Text> <Text>{item.value}</Text>
                                    </List.Item>
                                )}
                            />

                        </Space>
                    </Card>
                </div>

            )}


        </>
    );
}

const useApplications = (session: string, id: string) => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await fetch("/api/applications/list?token=" + session + "&companyProfile=" + id);
                const data = await res.json();
                setApplications(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch applications');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [session, id]);

    return { applications, loading, error };
};

function ApplicationSectionCompany({ session, id, messages }: ApplicationSectionProps) {
     let { applications, loading, error } = useApplications(session, id);
    applications = applications.filter((application:{
        sector: string,
        maxTime: number,
        minTime: number,
        location: {
            country: string,
            region: string,
            city: string,
        },
        weekly_hours: number,
        applied_users: {
            _id: string,
            application_time: string;
            user_id: string;
        }[],
        chosen_user: string,
        creation_time: string
    }) => application.applied_users.length > 0);

    if (loading) return  <Card title={messages["dashboard-user-appliactions"] || "User Applications"}>
        <Space align="center" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Spin indicator={<LoadingOutlined spin />} size="large"  />
        </Space>
    </Card>

    if (error) return <Card title={messages["dashboard-company-appliactions"] || "Company Applications"}>
        <Text type="secondary">{error}</Text>
    </Card>;

    return(
        <Card title={messages["dashboard-company-appliactions"] || "Company Applications"}>
            <List
                dataSource={applications.filter((application: {
                    sector: string,
                    maxTime: number,
                    minTime: number,
                    location: {
                        country: string,
                        region: string,
                        city: string,
                    },
                    weekly_hours: number,
                    applied_users: {
                        _id: string,
                        application_time: string;
                        user_id: string;
                    }[],
                    chosen_user: string,
                    creation_time: string
                }) => {
                   return applications
                })}
                renderItem={(item: {
                    title: string,
                    description: string,
                    sector: string,
                    maxTime: number,
                    minTime: number,
                    location: {
                        country: string,
                        region: string,
                        city: string,
                    },
                    _id: string,
                    issuer_id: string,
                    weekly_hours: number,
                    applied_users: {
                        _id: string;
                        application_time: string;
                        user_id: string;
                    }[],
                    chosen_user: string,
                    creation_time: string
                }) => (
                    <ApplicationCard item={item} messages={messages} isCompany={true} token={session} id={id}/>
                )}
            />
        </Card>
    );
}


function ApplicationSectionUser({ session, id, messages }: ApplicationSectionProps) {
    const [status, setStatus] = useState('-');

    let { applications, loading, error } = useApplications(session, id);

    if (loading) return (
        <Card title={messages["dashboard-user-appliactions"] || "User Applications"}>
            <Space align="center" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin indicator={<LoadingOutlined spin />} size="large"  />
            </Space>
        </Card>
    );

    if (error) return (
        <Card title={messages["dashboard-user-appliactions"] || "User Applications"}>
            <Text type="secondary">{error}</Text>
        </Card>);

    return(
        <Card title={messages["dashboard-user-appliactions"] || "User Applications"}>
            <Space style={{ display: 'flex', gap: 8 }}>
                <Text>{messages["dashboard-status"] || "Status"}</Text>
                <Select defaultValue="-" style={{ width: 120 }} onChange={(value) => {setStatus(value as string)}}>
                    <Select.Option value="-">All statuses</Select.Option>
                    <Select.Option value="pending">Pending <MinusCircleOutlined style={{ color: 'gold' }}/></Select.Option>
                    <Select.Option value="accepted">Accepted <CheckCircleOutlined style={{ color: 'green' }}/></Select.Option>
                    <Select.Option value="rejected">Rejected <CloseCircleOutlined style={{ color: 'red' }}/></Select.Option>
                </Select>
            </Space>
            <List
                dataSource={applications.filter((application: {
                    title: string,
                    description: string,
                    sector: string,
                    maxTime: number,
                    minTime: number,
                    location: {
                        country: string,
                        region: string,
                        city: string,
                    },
                    _id: string,
                    issuer_id: string,
                    weekly_hours: number,
                    applied_users: string[],
                    chosen_user: string,
                    creation_time: string
                }) => {
                    if(status === '-')
                        return application;
                    if(status === 'pending')
                        return application.chosen_user === undefined;
                    if(status === 'accepted')
                        return application.chosen_user === id;
                    if(status === 'rejected')
                        return application.chosen_user !== id;
                })}
                renderItem={(item: {
                    title: string,
                    description: string,
                    sector: string,
                    maxTime: number,
                    minTime: number,
                    location: {
                        country: string,
                        region: string,
                        city: string,
                    },
                    _id: string,
                    issuer_id: string,
                    weekly_hours: number,
                    applied_users: {
                        _id: string;
                        application_time: string;
                        user_id: string;
                    }[],
                    chosen_user: string,
                    creation_time: string
                }) => (
                    <ApplicationCard item={item} messages={messages} isCompany={false} token={session} id={id}/>
                )}
            />
        </Card>
    );
}

export  {ApplicationSectionUser, ApplicationSectionCompany};