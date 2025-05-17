import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {
    Card,
    List,
    Button,
    Space,
    Typography,
    Select,
    InputNumber,
    Avatar,
    Spin,
    Input,
    Form,
    Empty,
    Skeleton, Modal, message
} from 'antd';
import {
    CheckCircleOutlined,
    CheckOutlined,
    CloseCircleOutlined,
    CloseOutlined,
    DeleteOutlined,
    LoadingOutlined,
    MinusCircleOutlined,
    PlusOutlined,
    SaveOutlined,
    StarOutlined,
    UserOutlined
} from '@ant-design/icons';
import {DashedButton, LinkButton, PrimaryButton} from '../buttons/Buttons';
import {Paragraph, Title} from '../Typography';
import ProfileCard, {ProfileCompanyData, ProfileUserData} from "@/components/dashboard/ProfileCard";
import { set } from 'mongoose';
import { on } from 'events';

const {Item} = List;
const {Text} = Typography;

// Utility function to detect query parameters
const useQueryParams = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const [queryParams, setQueryParams] = useState<Record<string, string | null>>({});

    useEffect(() => {
        const queryObject: Record<string, string | null> = {};
        searchParams.forEach((value, key) => {
            queryObject[key] = value;
        });
        setQueryParams(queryObject);
    }, [searchParams.toString()]);

    return queryParams;
}

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
            message:string;
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

const handleAccept = (session: string, applicationId: string, userId: string, application: any, onFinish: Function, messages: any)  => {
    Modal.confirm({
        title: messages["dashboard-accept-application-title"] || "Conferma accettazione",
        content: messages["dashboard-accept-application-content"] || 'Sei sicuro di voler accettare questa candidatura?',
        okText: messages["dashboard-accept-application-ok"] || 'Accetta',
        cancelText: messages["dashboard-accept-application-cancel"] || 'Annulla',
        onOk: async () => {
            const data = {
                token: session,
                positionId: applicationId,
                title: application?.title,
                description: application?.description,
                sector: application?.sector,
                country: application?.location.country,
                region: application?.location.region,
                city: application?.location.city,
                weeklyHours: application?.weekly_hours,
                chosenUser: userId,
            };
            try {
                const res = await fetch(`/api/positions`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                if (res.ok) {
                    message.success('Candidatura accettata con successo');
                   onFinish();
                } else {
                    message.error('Errore durante l\'accettazione della candidatura');
                }
            } catch {
                message.error('Errore di rete');
            }
        }
    });
};

const handleReject = (session: string, applicationId: string, userId: string, application: any, onFinish: Function, messages: any) => {
    Modal.confirm({
        title: messages["dashboard-reject-application-title"] || "Conferma rifiuto",
        content: messages["dashboard-reject-application-content"] || 'Sei sicuro di voler rifiutare questa candidatura?',
        okText: messages["dashboard-reject-application-ok"] || 'Rifiuta',
        cancelText: messages["dashboard-reject-application-cancel"] || 'Annulla',
        onOk: async () => {
            const data = {
                token: session,
                positionId: applicationId,
                title: application.title,
                description: application.description,
                sector: application.sector,
                country: application.location.country,
                region: application.location.region,
                city: application.location.city,
                weeklyHours: application.weekly_hours,
                chosenUser: "",
            };
            try {
                const res = await fetch(`/api/positions`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                if (res.ok) {
                    message.success('Candidatura rifiutata');
                    onFinish();
                } else {
                    message.error('Errore durante il rifiuto della candidatura');
                }
            } catch {
                message.error('Errore di rete');
            }
        }
    });
};

const handleDelete = (session: string, applicationId: string, userId: string, applied_users: any, application: any, messages: any) => {
    Modal.confirm({
        title: messages["dashboard-delete-application-title"] || "Conferma eliminazione",
        content: messages["dashboard-delete-application-content"] || 'Sei sicuro di voler eliminare questa candidatura?',
        okText: messages["dashboard-delete-application-ok"] || 'Elimina',
        cancelText: messages["dashboard-delete-application-cancel"] || 'Annulla',
        onOk: async () => {
            const data = {
                token: session,
                positionId: applicationId,
            };
            try {
                const res = await fetch(`/api/positions`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                if (res.ok) {
                    message.success('Candidatura eliminata');
                    
                } else {
                    message.error('Errore durante l\'eliminazione della candidatura');
                }
            } catch {
                message.error('Errore di rete');
            }
        }
    });
};

function useUserProfileData(token: string, id: string, isACompany: boolean) {
    const [values, setValues] = useState<ProfileUserData | ProfileCompanyData>()

    useEffect(() => {
        const fetchProfileData = async () => {
            const res = await fetch(`/api/profiles?token=${token}&profileId=${id}`, {
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
                    address: data.address?.address,
                    city: data.address?.city,
                    region: data.address?.region,
                    country: data.address?.country,
                    postal_code: data.address?.postal_code,
                    street: data.address?.street
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
                    address: data.address?.address,
                    city: data.address?.city,
                    region: data.address?.region,
                    country: data.address?.country,
                    postal_code: data.address?.postal_code,
                    street: data.address?.street
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


const UserDetailsRow = ({
                            user,
                            token,
                            messages,
                            applicationId,
                            companyId,
                            application,
                        }: {
    user: {
        _id: string;
        application_time: string;
        message: string;
        user_id: string;
    };
    token: string;
    messages: any;
    applicationId: string;
    companyId: string;
    application: {
        _id: string;
        title: string;
        description: string;
        sector: string;
        maxTime: number;
        minTime: number;
        location: {
            country: string;
            region: string;
            city: string;
        };
        issuer_id: string;
        weekly_hours: number;
        applied_users: {
            _id: string;
            application_time: string;
            message:string;
            user_id: string;
        }[];
        chosen_user: string;
        creation_time: string
    };
}) => {
    const [showProfileCard, setShowProfileCard] = useState(false);
    const profile_data = useUserProfileData(token, user.user_id, false) as ProfileUserData | null;
    const isLoading = !profile_data;
    const [isChosen, setIsChosen] = useState(false);

useEffect(() => {
    setIsChosen(application.chosen_user === user.user_id && application.chosen_user !== undefined);
}, [application.chosen_user, user.user_id]);
    //console.log(`Utente scelto:${application.chosen_user} e id:${user.user_id} e ${profile_data?.name}`)
    return (
        <>
            {(
                <>
                    <Item
                        style={{
                            display: 'flex',
                            gap: 24,
                            justifyContent: 'space-between',
                            ...((isChosen)
                                ? {
                                    backgroundColor: 'lightgreen',
                                    padding: '16px',
                                    borderRadius: '25px',
                                }
                                : {}),
                        }}
                        id={applicationId}
                    >
                        <List.Item.Meta
                            key={user.user_id}
                            title={
                                <Skeleton loading={isLoading} avatar active paragraph={false}>
                                    <Space style={{display: 'flex', justifyContent: 'start'}}>
                                        <Avatar
                                            src={profile_data?.profile_image || undefined}
                                            icon={<UserOutlined/>}
                                            onClick={() => setShowProfileCard(!showProfileCard)}
                                            className="avatar-logo"
                                            style={{cursor: 'pointer'}}
                                        />
                                        <Text strong>{profile_data?.name}</Text>
                                    </Space>
                                </Skeleton>
                            }
                            description={
                                <Space
                                    direction="vertical"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <div>
                                        {user?.message && <Text strong>{user?.message}</Text>}
                                    </div>
                                    <div style={{display: 'flex', gap: 8}}>
                                        {(isChosen) ? (
                                            <>
                                                <LinkButton
                                                onClick={() => {
                                                    handleReject(token, applicationId, user.user_id, application, () => setIsChosen(false), messages);
                                                    
                                                }}

                                                style={{
                                                    border: '1px solid red',
                                                    color: 'red',
                                                }}
                                            >
                                                <CloseOutlined/>
                                            </LinkButton>
                                            </>
                                            ) : (
                                            <>
                                            <LinkButton
                                                    onClick={() =>{
                                                        handleAccept(token, applicationId, user.user_id, application,() => setIsChosen(true),messages);
                                                    }
                                                    }
                                                    style={{
                                                        border: '1px solid green',
                                                        color: 'green',
                                                    }}
                                                >
                                                    <CheckOutlined/>
                                                </LinkButton>
                                         
                                            </>
                                        )}
                                         <PrimaryButton onClick={() => setShowProfileCard(!showProfileCard)}>
                                                {messages['dashboard-application-show-user-profile'] ||
                                                    'Show user profile'}
                                            </PrimaryButton>
                                    </div>
                                </Space>
                            }
                        />
                    </Item>

                    <Modal
                        open={showProfileCard}
                        onCancel={() => setShowProfileCard(false)}
                        footer={null}
                        centered
                        width={800}
                        bodyStyle={{ padding: '2rem' }}
                    >
                    {showProfileCard && profile_data && (
                        <div

                        >
                            <ProfileCard
                                session={token}
                                messages={messages}
                                isCompany={false}
                                isOwner={false}
                                profileData={profile_data}
                                id={user._id}

                            />
                        </div>
                    )}
                    </Modal>
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

const WriteReviewModal = ({
                              token,
                              user_id,
                              applicationId,
                              onClose,
                              messages,
                              reviewedProfile
                          }: WriteReviewModalProps) => {
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
                const res = await fetch(`/api/reviews`, {
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
            <Card style={{width: '80%'}} title={
                <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                    {messages["dashboard-write-review"] || "Write review"}
                    <Button onClick={onClose}><CloseOutlined/></Button>
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
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label={messages["dashboard-write-review-review"] || "Review"}
                        name="review"
                    >
                        <Input.TextArea/>
                    </Form.Item>

                    <Form.Item
                        label={<>{messages["dashboard-write-review-rating"] || "Rating "} <StarOutlined color='gold'
                                                                                                        style={{marginRight: 8}}/></>}
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

                <PrimaryButton onClick={handleSaveReview}
                               style={{alignSelf: 'flex-end'}}>{messages["dashboard-save"] || "Save"}
                    <SaveOutlined/></PrimaryButton>
            </Card>
        </div>
    );
};

const ApplicationCard = ({item, token, user_company_id, messages, isCompany}: ApplicationCardProps) => {
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
                    {item.applied_users.map((user) => (
                        <UserDetailsRow user={user} token={token} messages={messages} applicationId={item._id}
                                        companyId={user_company_id} application={item}/>
                    ))}

                </>
            ) : (
                <>
                    <Item style={{display: 'flex', gap: 24, justifyContent: 'space-between'}} id={item._id}>

                        {(item.chosen_user === undefined || item.chosen_user === null || item.chosen_user === '') ? (
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
                                    justifyContent: 'space-between',
                                    width: '100%'
                                }}>
                                   
                                     <Paragraph style={{width:'12rem'}}>
                                            <Text><b>{messages["dashboard-application-description"] || "Description"}: </b></Text>
                                            <Text type="secondary">{item.description}</Text>
                                        </Paragraph>
                                        <Paragraph style={{width:'12rem'}}>
                                            <Text><b>{messages["dashboard-application-sector"] || "Sector"}: </b></Text>
                                            <Text type="secondary">{item.sector}</Text>
                                        </Paragraph>
                                        <Paragraph style={{width:'12rem'}}>
                                            <Text><b>{messages["dashboard-application-location"] || "Location"}: </b></Text>
                                            <Text type="secondary">{item.location?.city}</Text>
                                        </Paragraph>
                                        <Paragraph style={{width:'12rem'}}>
                                            <Text><b>{messages["dashboard-application-time"] || "Time"}: </b></Text>
                                            <Text type="secondary">{item.minTime} - {item.maxTime}</Text>
                                        </Paragraph>
                                    <div style={{display: 'flex', gap: 8}}>
                                        <DashedButton onClick={() => {
                                            handleDelete(token, item._id, user_company_id, item.applied_users, item, messages)
                                        }} style={{
                                            borderColor: 'red',
                                            color: 'red',
                                            backgroundColor: 'lightcoral'
                                        }}><DeleteOutlined style={{color: 'red'}}/></DashedButton>
                                        <PrimaryButton
                                            onClick={() => setShowCompleteCard(!showCompleteCard)}>{messages["dashboard-show-details"] || "Show details"}</PrimaryButton>
                                        {item.chosen_user === user_company_id && (
                                            <LinkButton
                                                onClick={() => (handleWriteReview(token, user_company_id, item._id))}>{messages["dashboard-write-review"] || "Write review"}
                                                <PlusOutlined/></LinkButton>
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
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Space style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <Title level={3} style={{ margin: 0 }}>{item.title}</Title>
                                <Button 
                                    onClick={() => setShowCompleteCard(false)} 
                                    type="text" 
                                    icon={<CloseCircleOutlined style={{ fontSize: '1.2rem', color: 'gray' }} />} 
                                />
                            </Space>
                            <Paragraph style={{ fontSize: '1rem', color: '#555' }}>{item?.description}</Paragraph>
                            <List
                                dataSource={[
                                    { label: messages["dashboard-application-sector"] || 'Sector', value: item?.sector },
                                    {
                                        label: messages["dashboard-application-location"] || 'Location',
                                        value: `${item?.location?.city}, ${item?.location?.region}, ${item?.location?.country}`
                                    },
                                    { label: messages["dashboard-application-time"] || 'Time', value: `${item?.minTime} - ${item?.maxTime} hours` },
                                    { label: messages["dashboard-application-weekly-hours"] || 'Weekly Hours', value: `${item?.weekly_hours} hours` },
                                    { label: messages["dashboard-application-creation-time"] || 'Created On', value: new Date(item?.creation_time).toLocaleDateString() },
                                    { label: messages["dashboard-application-applied-users"] || 'Applied Users', value: item?.applied_users.length },
                                    { label: messages["dashboard-application-chosen-user"] || 'Chosen User', value: item?.chosen_user || '-' },
                                ]}
                                renderItem={(detail) => (
                                    <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                                        <Text strong style={{ width: '30%' }}>{detail.label}:</Text>
                                        <Text style={{ color: '#555' }}>{detail.value as string}</Text>
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
                const url = isACompany ? `/api/positions?token=${session}&profileId=${id}` : `/api/applications?token=${session}&profileId=${id}`;
                const res = await fetch(url, {
                    method: "GET"
                });
                
                if (!res.ok) throw new Error('Failed to fetch applications');
                const data = await res.json();
                
                // Transform the data to match the expected format
                const transformedApplications = data.map((application: any) => ({
                    _id: application._id,
                    title: application.title,
                    description: application.description,
                    sector: application.sector,
                    weekly_hours: application.weekly_hours,
                    location: {
                        city: application.location.city,
                        region: application.location.region,
                        country: application.location.country
                    },
                    issuer_id: application.issuerId,
                    applied_users: application.applied_users || [],
                    chosen_user: isACompany ? application.chosen_user : application.chosenUser,
                    creation_time: application.creationTime,
                    isOpen: application.isOpen
                }));
                
                setApplications(transformedApplications);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch applications');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [session, id]);

    return {applications, loading, error};
};

function ApplicationSectionCompany({session, user_company_id, messages}: ApplicationSectionProps) {
    const {applications, loading, error} = useApplications(session, user_company_id, true);
    const queryParams = useQueryParams(); // Use the hook to get query parameters
    const filteredApplications = applications.filter((application: {
        applied_users: any[]
    }) => application.applied_users.length > 0);

    // Check for a specific query parameter (e.g., offerId) and filter applications if it exists
    const offerId = queryParams.offerId;
    const displayedApplications = offerId
        ? filteredApplications.filter((application) => application._id === offerId)
        : filteredApplications;

    if (loading) {
        return (
            <Card title={messages["dashboard-company-applications"] || "Company Applications"}>
                <Space align="center" style={{display: 'flex', justifyContent: 'center', height: '100%'}}>
                    <Spin indicator={<LoadingOutlined spin/>} size="large"/>
                </Space>
            </Card>
        );
    }

    if (error) {
        return (
            <Card title={messages["dashboard-company-applications"] || "Company Applications"}>
                <Text type="secondary">{error}</Text>
            </Card>
        );
    }

    return (
        <Card title={messages["dashboard-company-applications"] || "Company Applications"}>
            <List
                dataSource={displayedApplications}
                renderItem={(item) => (
                    <ApplicationCard
                        item={item}
                        messages={messages}
                        isCompany={true}
                        token={session}
                        user_company_id={user_company_id}
                    />
                )}
            />
        </Card>
    );
}

function ApplicationSectionUser({session, user_company_id, messages}: ApplicationSectionProps) {
    const {applications, loading, error} = useApplications(session, user_company_id, false);
    const queryParams = useQueryParams(); // Use the hook to get query parameters
    const [status, setStatus] = useState('-');

    const filteredApplications = applications.filter((application) => {
        if (status === '-') return true;
        if (status === 'pending') return application.isOpen;
        if (status === 'accepted') return application.chosen_user === user_company_id;
        if (status === 'rejected') return application.chosen_user !== user_company_id;
        return false;
    });

    // Check for a specific query parameter (e.g., offerId) and filter applications if it exists
    const offerId = queryParams.offerId;
    const displayedApplications = offerId
        ? filteredApplications.filter((application) => application._id === offerId)
        : filteredApplications;

    if (loading) {
        return (
            <Card title={messages["dashboard-user-applications"] || "User Applications"}>
                <Space align="center" style={{display: 'flex', justifyContent: 'center', height: '100%'}}>
                    <Spin indicator={<LoadingOutlined spin/>} size="large"/>
                </Space>
            </Card>
        );
    }

    if (error) {
        return (
            <Card title={messages["dashboard-user-applications"] || "User Applications"}>
                <Text type="secondary">{error}</Text>
            </Card>
        );
    }

    if (displayedApplications.length === 0) {
        return (
            <Card title={messages["dashboard-user-applications"] || "User Applications"}>
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
            </Card>
        );
    }

    return (
        <Card title={messages["dashboard-user-applications"] || "User Applications"}>
            <Space style={{display: 'flex', gap: 8}}>
                <Text>{messages["dashboard-status"] || "Status"}</Text>
                <Select defaultValue="-" style={{width: 120}} onChange={(value) => setStatus(value)}>
                    <Select.Option value="-">All statuses</Select.Option>
                    <Select.Option value="pending">
                        Pending <MinusCircleOutlined style={{color: 'gold'}}/>
                    </Select.Option>
                    <Select.Option value="accepted">
                        Accepted <CheckCircleOutlined style={{color: 'green'}}/>
                    </Select.Option>
                    <Select.Option value="rejected">
                        Rejected <CloseCircleOutlined style={{color: 'red'}}/>
                    </Select.Option>
                </Select>
            </Space>
            <List
                dataSource={displayedApplications}
                renderItem={(item) => (
                    <ApplicationCard
                        item={item}
                        messages={messages}
                        isCompany={false}
                        token={session}
                        user_company_id={user_company_id}
                    />
                )}
            />
        </Card>
    );
}

export {ApplicationSectionUser, ApplicationSectionCompany};