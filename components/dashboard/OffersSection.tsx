// OffersSection.tsx
"use client"
import React, { useState } from 'react';
import { Card, List, Button, Input, Space, Typography } from 'antd';
const {Item} = List;
const { Text } = Typography;

export default  function OffersSection({ messages }: { messages: any }) {
  const [newOffer, setNewOffer] = useState('');
  const [offers, setOffers] = useState([
    { title: 'Offer 1', description: 'Description for offer 1' },
    { title: 'Offer 2', description: 'Description for offer 2' },
  ]);

  const handleAddOffer = () => {
    setOffers([...offers, { title: newOffer, description: '' }]);
    setNewOffer('');
  };

  return(
  <Card title="Company Offers">
    <Input
      placeholder="New Offer"
      value={newOffer}
      onChange={(e) => setNewOffer(e.target.value)}
      style={{ width: 200 }}
    />
    <Button type="primary" onClick={handleAddOffer} style={{ marginLeft: 8 }}>
      Add
    </Button>
    <List
      dataSource={offers}
      renderItem={(item) => (
        <Item>
          <List.Item.Meta
            title={<Text strong>{item.title}</Text>}
            description={
              <Space direction="vertical">
                <Text type="secondary">{item.description}</Text>
                <Text type="danger">Delete</Text>
              </Space>
            }
          />
        </Item>
      )}
    />
  </Card>
);
}


