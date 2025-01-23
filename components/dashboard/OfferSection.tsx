// CompanyOffers.tsx
"use client"
import React, { useState } from 'react';
import { Card, List, Button, Input, Space, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { DashedButton, PrimaryButton } from '../buttons/Buttons';
const {Item} = List;
const { Text } = Typography;

interface OfferSectionProps {
    session: string; 
    id: string;      
    messages: any; 
}

interface Offer {
  title: string;
  description: string;
  messages: any;
  isCompany: boolean
}

const OfferCard = ({ title, description, messages, isCompany }: Offer) => ( 
  <Item>
  <List.Item.Meta
    title={<Text strong>{title}</Text>}
    description={
      <Space direction="vertical">
        <Text type="secondary">{description}</Text>
        {isCompany ?
          <DashedButton>{messages["dashboard-delete"] || "Delete"}</DashedButton>
          :
          <PrimaryButton >{messages["dashboard-apply"] || "Apply"}</PrimaryButton>
        }
      </Space>
    }
  />
</Item>

);



const OfferSectionCompany: React.FC<OfferSectionProps> = ({ session, id, messages }) => {

  const [newOffer, setNewOffer] = useState('');
  const [offers, setOffers] = useState([
    { title: 'Offer 1', description: 'Description for offer 1' },
    { title: 'Offer 2', description: 'Description for offer 2' },
  ]);

  const handleAddOffer = () => {
    if (newOffer) {
      setOffers([...offers, { title: newOffer, description: '' }]);
      setNewOffer('');
    }
  };

  return(
  <Card title={messages["dashboard-company-offers"] || "Company Offers"}>
    <Input
      placeholder={messages["dashboard-new-offer"] || "New Offer"}
      value={newOffer}
      onChange={(e) => setNewOffer(e.target.value)}
      style={{ width: 200 }}
    />
    <Button type="primary" onClick={handleAddOffer} style={{ marginLeft: 8 }}>
      {messages["dashboard-add"] || "Add"}
    </Button>
    <List
      dataSource={offers}
      renderItem={(item) => (
        <OfferCard title={item.title} description={item.description} messages={messages} isCompany={true} />
      )}
    />
  </Card>
);
}



const OfferSectionUser: React.FC<OfferSectionProps> = ({ session, id, messages }) => {
    const [newOffer, setNewOffer] = useState('');
    const [offers, setOffers] = useState([
      { title: 'Offer 1', description: 'Description for offer 1' },
      { title: 'Offer 2', description: 'Description for offer 2' },
    ]);

    const handleAddOffer = () => {
      if (newOffer) {
        setOffers([...offers, { title: newOffer, description: '' }]);
        setNewOffer('');
      }
    };

    return(
        <>
        <Card title={messages["dashboard-user-offers"] || "User Offers"}>
    <Input
      placeholder={messages["dashboard-search-offer"] || "Search Offer"}
      value={newOffer}
      onChange={(e) => setNewOffer(e.target.value)}
      style={{ width: 200 }}
    />
          <Button type="primary" onClick={handleAddOffer} style={{ marginLeft: 8 }}>
      {messages["dashboard-search"] || "Search"} <SearchOutlined/>
    </Button>
    <List
      dataSource={offers}
      renderItem={(item) => (
        <OfferCard title={item.title} description={item.description} messages={messages} isCompany={false} />
      )}
    />
        </Card>
        </>
    );
}


export {OfferSectionUser, OfferSectionCompany};