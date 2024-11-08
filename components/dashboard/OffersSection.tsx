// OffersSection.tsx
"use client"
import React from 'react';
import { Card, List } from 'antd';
const {Item} = List;
export default  function OffersSection({ messages }: { messages: any }) {
  return(
  <Card title="Company Offers">
    <List
      dataSource={[
        { title: 'Offer 1', description: 'Description for offer 1' },
        { title: 'Offer 2', description: 'Description for offer 2' },
      ]}
      renderItem={(item) => (
        <Item>
          <List.Item.Meta title={item.title} description={item.description} />
        </Item>
      )}
    />
  </Card>
);
}
