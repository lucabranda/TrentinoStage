"use client"
import React, { useState } from 'react';
import { Card, List, Button, Input, Space, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { DashedButton, PrimaryButton } from '../buttons/Buttons';
import {ApplicationsApi} from "@/api/applicationsApi";
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

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sector, setSector] = useState('');
    const [country, setCountry] = useState('');
    const [region, setRegion] = useState('');
    const [city, setCity] = useState('');
    const [weeklyhours, setWeeklyhours] = useState(0);

    //TODO: LOAD OFFERS
    const [offers, setOffers] = useState([
        { title: 'Offer 1', description: 'Description for offer 1' },
        { title: 'Offer 2', description: 'Description for offer 2' },
    ]);

    const handleAddOffer = () => {

        const api = new ApplicationsApi();
        api.apiApplicationsCreatePost(
            session,
            title,
            description,
            sector,
            country,
            region,
            city,
            weeklyhours
        ).then(

        );

    };

  return(
  <Card title={messages["dashboard-company-offers"] || "Company Offers"}>
      <Input
          placeholder={messages["dashboard-search-offer"]}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
      />
      <Input
          placeholder={messages["dashboard-search-offer"]}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
      />
      <Input
          placeholder={messages["dashboard-search-offer"]}
          value={sector}
          onChange={(e) => setSector(e.target.value)}
      />
      <Input
          placeholder={messages["dashboard-search-offer"]}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
      />
      <Input
          placeholder={messages["dashboard-search-offer"]}
          value={region}
          onChange={(e) => setRegion(e.target.value)}
      />
      <Input
          placeholder={messages["dashboard-search-offer"]}
          value={city}
          onChange={(e) => setCity(e.target.value)}
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
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sector, setSector] = useState('');
    const [country, setCountry] = useState('');
    const [region, setRegion] = useState('');
    const [city, setCity] = useState('');
    const [weeklyhours, setWeeklyhours] = useState(0);

    //TODO: LOAD OFFERS
    const [offers, setOffers] = useState([
      { title: 'Offer 1', description: 'Description for offer 1' },
      { title: 'Offer 2', description: 'Description for offer 2' },
    ]);

    const handleAddOffer = () => {

      const api = new ApplicationsApi();
      api.apiApplicationsCreatePost(
          session,
          title,
          description,
          sector,
          country,
          region,
          city,
          weeklyhours
      ).then(

      );

    };

    return(
        <>
        <Card title={messages["dashboard-user-offers"] || "User Offers"}>

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