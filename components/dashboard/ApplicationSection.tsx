import React from 'react';
import { Card, List, Button, Input, Space, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { DashedButton, PrimaryButton } from '../buttons/Buttons';
const {Item} = List;
const { Text } = Typography;

interface ApplicationSectionProps {
    session: string; 
    id: string;      
    messages: any; 
}

interface Application {
    title: string;
    description: string;
    messages: any;
    isCompany: boolean;
}

const ApplicationCard = ({ title, description, messages, isCompany }: Application) => {
    return(
        <Item>
            <List.Item.Meta
                title={<Text strong>{title}</Text>}
                description={
                <Space direction="vertical">
                    <Text type="secondary">{description}</Text>
                    {isCompany ?
                    <PrimaryButton >{messages["dashboard-accept"] || "Accept"}</PrimaryButton>
                    :
                    <DashedButton>{messages["dashboard-reject"] || "Reject"}</DashedButton>
                    }
                </Space>
                }
            />
        </Item>
    );
}

const ApplicationSectionCompany: React.FC<ApplicationSectionProps> = ({ session, id, messages }) =>{
   
  const applications = [
      { title: 'Application 1', description: 'Description for application 1' },
      { title: 'Application 2', description: 'Description for application 2' },
    ];
  
    return(
    <Card title={messages["dashboard-company-appliactions"] || "Company Applications"}>
      <Input
        placeholder={messages["dashboard-search"] || "Search"}
        style={{ width: 200 }}
      />
      <Button type="primary"  style={{ marginLeft: 8 }}>
      {messages["dashboard-search"] || "Search"} <SearchOutlined/>
      </Button>
      <List
        dataSource={applications}
        renderItem={(item) => (
          <ApplicationCard title={item.title} description={item.description} messages={messages} isCompany={true} />
        )}
      />
    </Card>
  );
  }

const ApplicationSectionUser: React.FC<ApplicationSectionProps> = ({ session, id, messages }) => {
    const applications = [
        { title: 'Application 1', description: 'Description for application 1' },
        { title: 'Application 2', description: 'Description for application 2' },
      ];
    return(
        <Card title={messages["dashboard-company-appliactions"] || "Company Applications"}>
      <Input
        placeholder={messages["dashboard-search"] || "Search"}
        style={{ width: 200 }}
      />
      <Button type="primary"  style={{ marginLeft: 8 }}>
      {messages["dashboard-search"] || "Search"} <SearchOutlined/>
      </Button>
      <List
        dataSource={applications}
        renderItem={(item) => (
          <ApplicationCard title={item.title} description={item.description} messages={messages} isCompany={true} />
        )}
      />
    </Card>
    );
}

export  {ApplicationSectionUser, ApplicationSectionCompany};