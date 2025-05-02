import React, { useState, useEffect } from 'react';
import { Card, List, Button, Space, Typography, Select, InputNumber, Avatar, Spin, Input, Form, Empty } from 'antd';
import { CheckCircleOutlined, CheckOutlined, CloseCircleOutlined, CloseOutlined, DeleteOutlined, LoadingOutlined, MinusCircleOutlined, PlusOutlined, SaveOutlined, StarOutlined } from '@ant-design/icons';
import { DashedButton, LinkButton, PrimaryButton } from '../buttons/Buttons';
import { Paragraph, Title } from '../Typography';
import ProfileCard, {ProfileCompanyData, ProfileUserData} from "@/components/dashboard/ProfileCard";
const {Item} = List;
const { Text } = Typography;

interface ApplicationSectionProps {
    session: string;
    user_company_id: string;
    messages: any;
}

interface ApplicationCardProps { 
    item: {
        _id: string,
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
    user_company_id: string;
}

const handleAccept = async (session: string, applicationId: string, userId: string, application: any ) => {
    const res = await fetch(`/api/applications/modify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session}`,
        },
        body: JSON.stringify({
            token: session,
            id: applicationId,
            title: application.title,
            description: application.description,
            sector: application.sector,
            country: application.location.country,
            region: application.location.region,
            city: application.location.city,
            weekly_hours: application.weekly_hours,
            chosen_user: userId
        }),
    });
    if ((await res).ok) {
        console.log("Application accepted successfully");
    } else {
        console.log("An error occurred while accepting application");
    }
}

const handleReject = async (session: string, applicationId: string, userId: string, application: any ) => {
    const res = await fetch(`/api/applications/modify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session}`,
        },
        body: JSON.stringify({
            token: session,
            id: applicationId,
            title: application.title,
            description: application.description,
            sector: application.sector,
            country: application.location.country,
            region: application.location.region,
            city: application.location.city,
            weekly_hours: application.weekly_hours,
            chosen_user: application.chosen_user
        }),
    });
    if ((await res).ok) {
        console.log("Application rejected successfully");
    } else {
        console.log("An error occurred while rejecting application");
    }
}
const handleDelete = async (session: string, applicationId: string, userId: string, applied_users: any, application: any ) => {
    const res = await fetch(`/api/applications/modify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session}`,
        },
        body: JSON.stringify({
            token: session,
            id: applicationId,
            title: application.title,
            description: application.description,
            sector: application.sector,
            country: application.location.country,
            region: application.location.region,
            city: application.location.city,
            weekly_hours: application.weekly_hours,
            chosen_user: application.chosen_user,
            applied_users: applied_users.filter((user: any) => user.user_id !== userId)
        }),
    });
    if ((await res).ok) {
        console.log("Application deleted successfully");
    } else {
        console.log("An error occurred while deleting application");
    }
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
                    postalCode: data.postal_code,
                    street: data.street
                },
                sector: data.sector,
                website: data.website,
                identifier: data.identifier,
                profile_image: data.profile_image
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
                    postalCode: data.postal_code,
                    street: data.street
                },
                sector: data.sector,
                website: data.website,
                profile_image: data.profile_image,
                identifier: data.identifier
            });
            setValues(values as ProfileCompanyData | ProfileUserData);
        };

        if (token && id) {
            fetchProfileData();
        }
    }, [token, id]);

    return values;

}

const UserDetailsRow = ({user, token, messages, applicationId, companyId, application}: {
    user: {
        _id: string;
        application_time: string;
        user_id: string;
    };
    token: string;
    messages: any;
    applicationId: string;
    companyId: string;
    application: any;
}) => {

    const [showProfileCard, setShowProfileCard] = useState(false);
    const profile_data = useUserProfileData(token, user.user_id, false) as ProfileUserData;
    return (
        <>
        {(application.chosen_user === "" || application.chosen_user === user._id) && (
            <>
            <Item style={{display: 'flex', gap: 24, justifyContent: 'space-between', ...(application.chosen_user === user._id ? {backgroundColor: 'lightgreen', padding: '16px', borderRadius: '25px'} : {})}} id={applicationId}>
                <List.Item.Meta
                    key={user._id}
                    title={<Avatar src={profile_data?.profile_image}
                                   onClick={() => setShowProfileCard(!showProfileCard)}/>}
                    description={
                        <Space direction="vertical" style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <Text strong>{profile_data?.name}</Text>
                            
                            {/*user?.message && <Text strong>{user?.message}</Text>*/}
                  
                            <div style={{display: 'flex', gap: 8}}>
                                {(application.chosen_user === user._id) ? (
                                    <Text strong>{messages["dashboard-application-chosen-user"] || "Chosen User"}</Text>
                                ):(
                                    <>
                                        <LinkButton
                                            onClick={() => handleAccept(token, applicationId, user._id, application)}
                                            style={{
                                                border: '1px solid green',
                                                borderColor: 'green',
                                                color: 'green'
                                            }}><CheckOutlined/></LinkButton>
                                        <LinkButton
                                            onClick={() => handleReject(token, applicationId, user._id, application)}
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
                                </>
                                )}

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

                    <ProfileCard session={token} messages={messages} isCompany={false} isOwner={false} profileData={profile_data} id={user._id} closeButton={ (<Button onClick={() => setShowProfileCard(false)}
                                                                                                                                                                           style={{border: 'none'}}><CloseCircleOutlined/></Button>)}/>
                </div>
            )}
            </>
        )}
        </>
    );
};

interface WriteReviewModalProps {
    token: string;
    user_id: string;
    applicationId: string;
    onClose: () => void;
    messages: any;
    reviewedProfile: string;
}

const WriteReviewModal = ({ token, user_id, applicationId, onClose, messages, reviewedProfile }: WriteReviewModalProps) => {
    const [review, setReview] = useState({} as any);
    const [form] = Form.useForm();
  

    const handleSaveReview = async () => {
        form.validateFields()
            .then(async (values) => {
                const review = {
                    token: token,
                    reviewedProfile: reviewedProfile,
                    reviewer_id: user_id,
                    review: values.review,
                    title: values.title,
                    rating: values.rating
                };
                const res = await fetch(`/api/reviews/review`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(review),
                });
                console.log(res.body)
                if ((await res).ok) {
                    console.log(messages["success"] || "Review updated successfully");
                    onClose();
                } else {
                    console.log(messages["error"] || "An error occurred while updating review");
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return (
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
        }}>
            <Card style={{width:'80%'}} title={
                    <div  style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                       {messages["dashboard-write-review"] || "Write review"}
                        <Button onClick={onClose}><CloseOutlined /></Button>
                    </div>
                }
            >
                <Form
                    form={form}
                    name="write-review"
                    layout="vertical"
                >
                    <Form.Item
                        label={messages["dashboard-write-review-title"] || "Title"}
                        name="title"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label={messages["dashboard-write-review-review"] || "Review"}
                        name="review"
                    >
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item
                        label={<>{messages["dashboard-write-review-rating"] || "Rating " } <StarOutlined color='gold' style={{marginRight: 8}}/></>}
                        name="rating"
                    >
                        <InputNumber
                            min={1}
                            max={5}
                            defaultValue={1}
                            placeholder="1"
                        />
                       
                    </Form.Item>
                </Form>
                
                <PrimaryButton onClick={handleSaveReview} style={{alignSelf: 'flex-end'}}>{messages["dashboard-save"] || "Save"} <SaveOutlined /></PrimaryButton>
            </Card>
        </div>
    );
};

const ApplicationCard = ({ item, token, user_company_id, messages, isCompany }: ApplicationCardProps) => {
    const [showCompleteCard, setShowCompleteCard] = useState(false);
    const [showWriteReview, setShowWriteReview] = useState(false);
    const handleWriteReview = (token: string, issuerId: string, applicationId: string) => {
        setShowWriteReview(true);
    };
    return (
        <>
            {(isCompany) ? (
               <>
                  <Item style={{display: 'flex', gap: 24, justifyContent: 'space-between'}} id={item._id}>
                      <Title level={4}> {item.title}</Title>
                      <Text type="secondary">{item.applied_users.length} {messages["dashboard-applications"]}</Text>
                  </Item>
                  {item.applied_users.map((user) => (<UserDetailsRow user={user} token={token} messages={messages} applicationId={item._id} companyId={user_company_id}  application={item}/>))}
              </>
                ) : (
                    <>
                        <Item style={{display: 'flex', gap: 24, justifyContent: 'space-between'}} id={item._id}>

                        {(item.chosen_user === undefined) ? (
                            <MinusCircleOutlined style={{color: 'gold'}}/>
                        ) : item.chosen_user === user_company_id ? (
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
                                            handleDelete(token, item._id,user_company_id, item.applied_users, item)
                                        }} style={{
                                            borderColor: 'red',
                                            color: 'red',
                                            backgroundColor: 'lightcoral'
                                        }}><DeleteOutlined style={{color: 'red'}}/></DashedButton>
                                        <PrimaryButton
                                            onClick={() => setShowCompleteCard(!showCompleteCard)}>{messages["dashboard-show-details"] || "Show details"}</PrimaryButton>
                                        {item.chosen_user === user_company_id && (
                                            <LinkButton 
                                                onClick={() => (handleWriteReview(token, user_company_id, item._id))}>{messages["dashboard-write-review"] || "Write review"} <PlusOutlined /></LinkButton>
                                        )}
                                    </div>
                                </Space>
                            }
                        />

                    </Item>
                    {showWriteReview && (
                        <WriteReviewModal
                            token={token}
                            user_id={user_company_id}
                            applicationId={item._id}
                            onClose={() => setShowWriteReview(false)}
                            messages={messages}
                            reviewedProfile={item.issuer_id}
                        />
                    )}
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

const useApplications = (session: string, id: string, isACompany: boolean) => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const str = "&companyProfile=" + id;
                const res = await fetch("/api/applications/list?token=" + session + str,{
                    method: "GET"
                });
                const data = await res.json();
                console.log(data);
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

function ApplicationSectionCompany({ session, user_company_id, messages }: ApplicationSectionProps) {
    let { applications, loading, error } = useApplications(session, user_company_id, true);
    applications = applications.filter((application:{
        _id: string,
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
                dataSource={applications}
                renderItem={(item: {
                    _id: string,
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
                    <ApplicationCard item={item} messages={messages} isCompany={true} token={session} user_company_id={user_company_id}/>
                )}
            />
        </Card>
    );
}


function ApplicationSectionUser({ session, user_company_id, messages }: ApplicationSectionProps) {
    const [status, setStatus] = useState('-');

    let { applications, loading, error } = useApplications(session, user_company_id, false);

    if(applications.length === 0) return <Card title={messages["dashboard-user-appliactions"] || "User Applications"}>
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </Card>;


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
                        return application.chosen_user === user_company_id;
                    if(status === 'rejected')
                        return application.chosen_user !== user_company_id;
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
                    <ApplicationCard item={item} messages={messages} isCompany={false} token={session} user_company_id={user_company_id}/>
                )}
            />
        </Card>
    );
}

export  {ApplicationSectionUser, ApplicationSectionCompany};