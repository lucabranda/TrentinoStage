"use client"
import React, {useState} from 'react';
import {Card, List, Button, Input, Space, Typography, Form, Collapse, Tag, Modal} from 'antd';
import {message} from 'antd';
import {
    ClockCircleOutlined,
    DeleteFilled,
    EditFilled,
    EyeFilled, LoadingOutlined,
    PushpinOutlined,
    SnippetsFilled
} from '@ant-design/icons';
import {DashedButton, PrimaryButton} from '../buttons/Buttons';

const {Item} = List;
const {Text} = Typography;

interface OfferSectionProps {
    session: string;
    id: string;
    messages: any;
}

interface Offer {
    title: string;
    description: string;
    city: string;
    sector: string;
    weekly_hours: number;
    messages: any;
    isCompany: boolean;
    id: string;
    applied_users?: any[];
}

interface EditOfferModalProps {
    offer: Offer;
    session: string;
    onUpdate: (updatedOffer: Offer) => void;
}

const EditOfferModal: React.FC<EditOfferModalProps> = ({offer, session, onUpdate}) => {
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();

    const handleOpen = () => {
        form.setFieldsValue(offer); // Pre-fill the form with the current offer data
        setVisible(true);
    };

    const handleClose = () => {
        setVisible(false);
        form.resetFields();
    };

    const handleEdit = async (values: Offer) => {
        try {
            const response = await fetch(`/api/positions`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({...values, weeklyHours: values.weekly_hours, positionId: offer.id, token: session, country: "-", region: "-"}),
            });

            if (response.ok) {
                const updatedOffer = await response.json();
                onUpdate(updatedOffer); // Update the parent state with the new offer data
                handleClose();
            } else {
                throw new Error('Failed to update the offer');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <Button onClick={handleOpen} icon={<EditFilled/>}>
                {offer.messages["dashboard-edit"] || "Edit"}
            </Button>
            <Modal
                title={offer.messages["dashboard-edit-offer"] || "Edit Offer"}
                visible={visible}
                onCancel={handleClose}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleEdit}
                >
                    <Form.Item
                        name="title"
                        label={offer.messages["dashboard-title"] || "Title"}
                        rules={[{
                            required: true,
                            message: offer.messages["dashboard-title-required"] || "Please enter the title"
                        }]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label={offer.messages["dashboard-description"] || "Description"}
                        rules={[{
                            required: true,
                            message: offer.messages["dashboard-description-required"] || "Please enter the description"
                        }]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        name="sector"
                        label={offer.messages["dashboard-sector"] || "Sector"}
                        rules={[{
                            required: true,
                            message: offer.messages["dashboard-sector-required"] || "Please enter the sector"
                        }]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        name="weekly_hours"
                        label={offer.messages["dashboard-weekly-hours"] || "Weekly Hours"}
                        rules={[{
                            required: true,
                            message: offer.messages["dashboard-weekly-hours-required"] || "Please enter the weekly hours"
                        }, {
                            validator: (_, value) =>
                                value && value >= 1
                                    ? Promise.resolve()
                                    : Promise.reject(new Error(offer.messages["dashboard-offer-weekly-hours-min"] || "Weekly hours must be at least 1")),
                        }]}
                    >
                        <Input type="number"/>
                    </Form.Item>
                    <Form.Item
                        name="city"
                        label={offer.messages["dashboard-city"] || "City"}
                        rules={[{
                            required: true,
                            message: offer.messages["dashboard-city-required"] || "Please enter the city"
                        }]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {offer.messages["dashboard-save"] || "Save"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

const OfferCard = ({
                       title,
                       description,
                       city,
                       weekly_hours,
                       messages,
                       id,
                       isCompany,
                       session,
                       sector,
                       applicationsCount
                   }: Offer & { session: string, applicationsCount?: number }) => (

    <>a</>
);

interface FormValues {
    title: string;
    description: string;
    sector: string;
    weekly_hours: number;
    city: string;
    region: string;
    country: string;
    creation_time?: string;
    id?: string;
    applied_users?: any[];
}

const OfferSectionCompany: React.FC<OfferSectionProps> = ({session, id, messages}) => {
    const [offers, setOffers] = useState<FormValues[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isAccordionOpen, setIsAccordionOpen] = useState("1");
    const [form] = Form.useForm();
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [offerToDelete, setOfferToDelete] = useState<string | null>(null);

    let _offers: FormValues[] = [];

    function refresh() {
        setIsLoading(true);
    }

    const handleDeleteOffer = async () => {
        if (!offerToDelete) return;

        try {
            const response = await fetch("/api/positions", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: session, positionId: offerToDelete }),
            });

            if (response.ok) {
                message.success(messages["dashboard-offer-delete-success"] || "Offer deleted successfully!");
                refresh(); // Aggiorna la lista delle offerte
            } else {
                throw new Error(messages["dashboard-offer-delete-error"] || "Failed to delete offer.");
            }
        } catch (error) {
            message.error((error as any).message);
        } finally {
            setDeleteModalVisible(false);
            setOfferToDelete(null);
        }
    };

    const showDeleteModal = (offerId: string) => {
        setOfferToDelete(offerId);
        setDeleteModalVisible(true);
    };

    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
        setOfferToDelete(null);
    };

    if (isLoading) {
        fetch(`/api/positions?token=${session}&profileId=${id}`, {
            method: "GET"
        })
            .then(response => {
                if (!response.ok) throw new Error("Errore nella fetch");
                return response.json();
            })
            .then(data => {
                data.forEach((item: any) => {
                    _offers.push({
                        city: item.location.city,
                        country: item.location.country,
                        title: item.title,
                        description: item.description,
                        region: item.location.region,
                        sector: item.sector,
                        weekly_hours: item.weekly_hours,
                        creation_time: item.creation_time,
                        id: item._id,
                        applied_users: item.applied_users
                    });
                })

                setOffers(_offers);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Errore:", err);
            });
    }

    const handleAddOffer = async (values: FormValues) => {
        try {
            setIsCreating(true);
            const response = await fetch("/api/positions", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({...values, weeklyHours: values.weekly_hours, token: session, region: "a", country: "a"}),
            });

            if (response.ok) {
                refresh();
                message.success(messages["dashboard-offer-create-success"] || "Offer created successfully!");
                setIsCreating(false);
                form.resetFields(); // Clear form fields
                setIsAccordionOpen(""); // Close accordion
            } else {
                throw new Error(messages["dashboard-offer-create-error"] || "Failed to create offer.");
            }
        } catch (error) {
            message.error((error as any).message);
        }
    };

    return (
        <Card title={messages["dashboard-company-offers"]}>
            <Collapse
                activeKey={isAccordionOpen}
                onChange={(key) => setIsAccordionOpen(isAccordionOpen === "1" ? "" : "1")}
                items={[
                    {
                        key: "1",
                        label: messages["dashboard-company-offers-create"],
                        children: (
                            <Form
                                form={form}
                                name={"create-offer"}
                                layout={"vertical"}
                                onFinish={handleAddOffer}
                            >
                                <Form.Item
                                    name={"title"}
                                    label={messages["dashboard-offer-title"] || "Offer Title"}
                                    rules={[{
                                        required: true,
                                        message: messages["dashboard-offer-title-required"] || "Please enter the offer title"
                                    }]}
                                >
                                    <Input/>
                                </Form.Item>
                                <Form.Item
                                    name={"description"}
                                    label={messages["dashboard-offer-description"] || "Offer Description"}
                                    rules={[{
                                        required: true,
                                        message: messages["dashboard-offer-description-required"] || "Please enter the offer description"
                                    }]}
                                >
                                    <Input/>
                                </Form.Item>
                                <Form.Item
                                    name={"sector"}
                                    label={messages["dashboard-offer-sector"] || "Offer Sector"}
                                    rules={[{
                                        required: true,
                                        message: messages["dashboard-offer-sector-required"] || "Please enter the offer sector"
                                    }]}
                                >
                                    <Input/>
                                </Form.Item>
                                <Form.Item<number>
                                    name={"weekly_hours"}
                                    label={messages["dashboard-offer-weekly-hours"] || "Weekly Hours"}
                                    rules={[
                                        {
                                            required: true,
                                            message: messages["dashboard-offer-weekly-hours-required"] || "Please enter the weekly hours",
                                            min: 1
                                        },
                                        {
                                            validator: (_, value) =>
                                                value && value >= 1
                                                    ? Promise.resolve()
                                                    : Promise.reject(new Error(messages["dashboard-offer-weekly-hours-min"] || "Weekly hours must be at least 1")),
                                        }
                                    ]
                                    }
                                >
                                    <Input type={"number"}/>
                                </Form.Item>
                                <Form.Item
                                    name={"city"}
                                    label={messages["dashboard-offer-city"] || "City"}
                                    rules={[{
                                        required: true,
                                        message: messages["dashboard-offer-city-required"] || "Please enter the city"
                                    }]}
                                >
                                    <Input/>
                                </Form.Item>
                                <Button htmlType={"submit"} type={"primary"} loading={isCreating}>
                                    {messages["dashboard-company-offers-create"]}
                                </Button>
                            </Form>
                        )
                    }
                ]}
            />
            <List
                dataSource={offers}
                loading={isLoading}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <>
                                <Button
                                    danger={true}
                                    icon={<DeleteFilled />}
                                    onClick={() => showDeleteModal(item.id ?? "")}
                                />
                                &nbsp;
                                <EditOfferModal offer={{
                                    city: item.city,
                                    weekly_hours: item.weekly_hours,
                                    messages,
                                    id: item.id ?? "",
                                    isCompany: true,
                                    description: item.description,
                                    title: item.title,
                                    sector: item.sector
                                }} session={session} onUpdate={() => {
                                    refresh()
                                }}/>
                                &nbsp;
                                <Button
                                    type={"dashed"}
                                    disabled={(item.applied_users?.length ?? 0) === 0}
                                    onClick={() => {
                                        window.location.hash = "applications";
                                        const url = new URL(window.location.href);
                                        url.searchParams.set("offerId", item.id ?? "");
                                        window.history.pushState({}, "", url.toString());
                                    }}
                                >
                                    <SnippetsFilled /> {item.applied_users?.length ?? 0}
                                </Button>                            </>

                        ]}
                    >
                        <List.Item.Meta
                            title={<><Text strong>{item.title}</Text>&nbsp;<Tag
                                color="geekblue"><ClockCircleOutlined/>&nbsp;{item.weekly_hours}
                            </Tag><Tag color="purple">&nbsp;<PushpinOutlined/>{item.city}</Tag></>}
                            description={<Text type="secondary">{item.description}</Text>}
                        />
                    </List.Item>
                )}
            />
            <Modal
                title={<span>{messages["dashboard-offer-delete-confirm"] || "Confirm Delete"}</span>}
                visible={deleteModalVisible}
                onOk={handleDeleteOffer}
                onCancel={handleCancelDelete}
                okText={messages["dashboard-delete"] || "Delete"}
                cancelText={messages["dashboard-cancel"] || "Cancel"}
                okButtonProps={{ danger: true }}
            >
                <p>{messages["dashboard-offer-delete-message"] || "Are you sure you want to delete this offer?"}</p>
            </Modal>
        </Card>
    );
};

const OfferSectionUser: React.FC<OfferSectionProps> = ({session, id, messages}) => {
    const [offers, setOffers] = useState<FormValues[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    let _offers: FormValues[] = [];

    if (isLoading) {

        fetch(`/api/positions?token=${session}&profileId=${id}`, {
            method: "GET"
        })
            .then(response => {
                if (!response.ok) throw new Error("Errore nella fetch");
                return response.json();
            })
            .then(data => {
                data.forEach((item: any) => {
                    _offers.push({
                        city: item.location.city,
                        country: item.location.country,
                        title: item.title,
                        description: item.description,
                        region: item.location.region,
                        sector: item.sector,
                        weekly_hours: item.weekly_hours,
                        creation_time: item.creation_time,
                        id: item._id
                    });
                })

                setOffers(_offers);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Errore:", err);
            });
    }

    return (
        <>
            <Card title={messages["dashboard-user-offers"] || "User Offers"}>
                <List
                    loading={isLoading}
                    dataSource={offers}
                    renderItem={(item) => (
                        <OfferCard title={item.title} description={item.description} city={item.city}
                                   weekly_hours={item.weekly_hours} messages={messages} isCompany={false}
                                   id={item.id ?? ""} session={session ?? ""} sector={item.sector}/>
                    )}
                />
            </Card>
        </>
    );
}


export {OfferSectionUser, OfferSectionCompany};
