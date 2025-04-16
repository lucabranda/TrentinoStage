"use client"
import React, {useState} from 'react';
import {Card, List, Button, Input, Space, Typography, Form, Collapse, Tag, Modal} from 'antd';
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
    weekly_hours: number;
    messages: any;
    isCompany: boolean;
    id: string;
}

interface EditOfferModalProps {
    offer: Offer;
    session: string;
    onUpdate: (updatedOffer: Offer) => void;
}

const EditOfferModal: React.FC<EditOfferModalProps> = ({ offer, session, onUpdate }) => {
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
            const response = await fetch(`/api/applications/modify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...values, id: offer.id, token: session, country: "-", region: "-" }),
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
            <Button onClick={handleOpen} icon={<EditFilled />}>
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
                        rules={[{ required: true, message: offer.messages["dashboard-title-required"] || "Please enter the title" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label={offer.messages["dashboard-description"] || "Description"}
                        rules={[{ required: true, message: offer.messages["dashboard-description-required"] || "Please enter the description" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="sector"
                        label={offer.messages["dashboard-sector"] || "Sector"}
                        rules={[{ required: true, message: offer.messages["dashboard-sector-required"] || "Please enter the sector" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="weekly_hours"
                        label={offer.messages["dashboard-weekly-hours"] || "Weekly Hours"}
                        rules={[{ required: true, message: offer.messages["dashboard-weekly-hours-required"] || "Please enter the weekly hours" }]}
                    >
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item
                        name="city"
                        label={offer.messages["dashboard-city"] || "City"}
                        rules={[{ required: true, message: offer.messages["dashboard-city-required"] || "Please enter the city" }]}
                    >
                        <Input />
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

const OfferCard = ({ title, description, city, weekly_hours, messages, id, isCompany, session }: Offer & { session: string }) => (
    <List.Item
        actions={[
            isCompany ?
                (<>
                    <Button danger={true} icon={<DeleteFilled/>}/>
                    &nbsp;
                    <EditOfferModal offer={{
                        city, weekly_hours, messages, id, isCompany, description, title
                    }} session={session} onUpdate={()=>{/*TODO:UPDATE*/}} />
                    &nbsp;
                    <DashedButton><SnippetsFilled /> 10 {/*TODO*/}</DashedButton>
                </>)
                :
                <PrimaryButton>{messages["dashboard-apply"] || "Apply"}</PrimaryButton>

        ]}
    >
        <List.Item.Meta
            title={<><Text strong>{title}</Text>&nbsp;<Tag color="geekblue"><ClockCircleOutlined/>&nbsp;{weekly_hours}
            </Tag><Tag color="purple">&nbsp;<PushpinOutlined/>{city}</Tag></>}
            description={<Text type="secondary">{description}</Text>}
        />
    </List.Item>

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
}

const OfferSectionCompany: React.FC<OfferSectionProps> = ({session, id, messages}) => {
    const [offers, setOffers] = useState<FormValues[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    let _offers: FormValues[] = [];

    if(isLoading) {
        fetch(`/api/applications/list?token=${session}&profileId=${id}`, {
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


    const handleAddOffer = async (values: FormValues) => {

        const {title, description, sector, weekly_hours, city} = values;

        const response = await fetch("/api/applications/create", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({...values, token: session, region: "a", country: "a"}),
        });

        if (response.ok) {
            setOffers([...offers, values]);
        }
    };

    return (
        <Card title={messages["dashboard-company-offers"]}>
            <Collapse items={
                [{
                    key: 1,
                    label: messages["dashboard-company-offers-create"],
                    children: (
                        <Form
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
                                }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name={"description"}
                                label={messages["dashboard-offer-description"] || "Offer Description"}
                                rules={[{
                                    required: true,
                                    message: messages["dashboard-offer-description-required"] || "Please enter the offer description"
                                }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name={"sector"}
                                label={messages["dashboard-offer-sector"] || "Offer Sector"}
                                rules={[{
                                    required: true,
                                    message: messages["dashboard-offer-sector-required"] || "Please enter the offer sector"
                                }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item<number>
                                name={"weekly_hours"}
                                label={messages["dashboard-offer-weekly-hours"] || "Weekly Hours"}
                                rules={[{
                                    required: true,
                                    message: messages["dashboard-offer-weekly-hours-required"] || "Please enter the weekly hours",
                                    min: 1
                                }]}>
                                <Input type={"number"} />
                            </Form.Item>
                            <Form.Item
                                name={"city"}
                                label={messages["dashboard-offer-city"] || "City"}
                                rules={[{
                                    required: true,
                                    message: messages["dashboard-offer-city-required"] || "Please enter the city"
                                }]}>
                                <Input />
                            </Form.Item>
                            <Button htmlType={"submit"} type={"primary"}>{messages["dashboard-company-offers-create"]}</Button>
                        </Form>
                    )
                }]
            }/>

            <List
                dataSource={offers}
                loading={isLoading}
                renderItem={(item) => (
                    <OfferCard title={item.title} description={item.description} city={item.city}
                               weekly_hours={item.weekly_hours} messages={messages} isCompany={true} id={item.id ?? ""} session={session ?? ""}/>
                )}
            />
        </Card>
    );
}


const OfferSectionUser: React.FC<OfferSectionProps> = ({session, id, messages}) => {
    const [offers, setOffers] = useState<FormValues[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    let _offers: FormValues[] = [];

    if(isLoading) {

        fetch(`/api/applications/list?token=${session}&profileId=${id}`, {
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
                                   weekly_hours={item.weekly_hours} messages={messages} isCompany={false} id={item.id ?? ""} session={session ?? ""}/>
                    )}
                />
            </Card>
        </>
    );
}


export {OfferSectionUser, OfferSectionCompany};