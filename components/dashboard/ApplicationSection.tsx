import React, { useState, useEffect } from 'react';
import { Card, List, Button, Space, Typography, Select, InputNumber } from 'antd';
import { CheckCircleOutlined, CheckOutlined, CloseCircleOutlined, CloseOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { DashedButton, PrimaryButton } from '../buttons/Buttons';
import { Paragraph, Title } from '../Typography';
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
        applied_users: string[],
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

const ApplicationCard = ({ item, token, id, messages, isCompany }: Application) => {
  const [showCompleteCard, setShowCompleteCard] = useState(false);  
  return(
    <>
        <Item style={{ display: 'flex', gap: 24, justifyContent: 'space-between' }}>
          {/* status view: pending, accepted, rejected. Display a colored circle*/}
          {!isCompany && (
            item.chosen_user === undefined ? (
              <MinusCircleOutlined style={{ color: 'gold' }} />
            ) : item.chosen_user === item.issuer_id ? (
              <CheckCircleOutlined style={{ color: 'green' }} />
            ) : (
              <CloseCircleOutlined style={{ color: 'red' }} />
            )
          )}
            <List.Item.Meta
                title={<Text strong>{item.title}</Text>}
                description={
                <Space direction="vertical" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Paragraph>
                      <Text ><b> {messages["dashboard-application-description"] || "Description"}: </b></Text>
                      <Text type="secondary">{item.description}</Text>
                    </Paragraph>
                    <Paragraph>
                      <Text ><b> {messages["dashboard-application-sector"] || "Sector"}: </b></Text>
                      <Text type="secondary">{item.sector}</Text>
                    </Paragraph>
                    <Paragraph>
                      <Text ><b> {messages["dashboard-application-location"] || "Location"}: </b></Text>
                      <Text type="secondary">{item.location?.city}</Text>
                    </Paragraph>
                    <Paragraph>
                      <Text ><b> {messages["dashboard-application-time"] || "Time"}: </b></Text>
                      <Text type="secondary">{item.minTime} - {item.maxTime}</Text>
                    </Paragraph>
                    {isCompany ?
                      <div style={{ display: 'flex', gap: 8 }}>
                        <PrimaryButton onClick={() => {handleAccept(token, id, item._id, item.issuer_id)}} style={{ borderColor: 'green', backgroundColor: 'green' }}><CheckOutlined /></PrimaryButton>
                        <DashedButton onClick={() => {handleReject(token, id, item._id, item.issuer_id)}} style={{ borderColor: 'red', color: 'red' , backgroundColor:'lightcoral'}}><CloseOutlined /></DashedButton>
                        <PrimaryButton onClick={() => setShowCompleteCard(!showCompleteCard)}>{messages["dashboard-show-details"] || "Show details"}</PrimaryButton>
                      </div>
                    :
                      <div style={{ display: 'flex', gap: 8 }}>
                        <DashedButton onClick={() => {handleDelete(token, id)}} style={{ borderColor: 'red', color: 'red', backgroundColor: 'lightcoral' }}><DeleteOutlined style={{ color: 'red' }} /></DashedButton>
                        <PrimaryButton onClick={() => setShowCompleteCard(!showCompleteCard)}>{messages["dashboard-show-details"] || "Show details"}</PrimaryButton>
                      </div>
                    }
                   </Space>
                }
            />
        </Item>
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
              <Space direction="vertical" size="large" style={{ width: '100%' ,display: 'flex'}}>
                <Space style={{ justifyContent: 'space-between' , width: '100%' ,display: 'flex'}}> 
                <Title level={3}>{item.title}</Title>
                  <Button  onClick={() => setShowCompleteCard(false)} style={{border: 'none'}}><CloseCircleOutlined /></Button>
                </Space>
               <Paragraph>{item.description}</Paragraph>
                <List
                  dataSource={[
                    { label: 'Sector', value: item.sector },
                    { label: 'Location', value: `${item.location?.city}, ${item.location?.region}, ${item.location?.country}` },
                    { label: 'Time', value: `${item.minTime} - ${item.maxTime}` },
                    { label: 'Issuer ID', value: item.issuer_id },
                    { label: 'Weekly hours', value: item.weekly_hours },
                    { label: 'Applied users', value: item.applied_users?.join(', ') },
                    { label: 'Chosen user', value: item.chosen_user || 'None' },
                    { label: 'Creation time', value: item.creation_time },

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
  const [showFilters, setShowFilters] = useState(false);

  const [sector, setSector] = useState("-");
  const [country, setCountry] = useState("-");
  const [region, setRegion] = useState("-");
  const [city, setCity] = useState("-");
  const [maxTime, setMaxTime] = useState(24);
  const [minTime, setMinTime] = useState(0);
  const [weeklyHours, setWeeklyHours] = useState(40);
  const [creation_time, setCreationTime] = useState("-");
  const [applied_users, setAppliedUsers] = useState<string[]>([]);
  const [chosen_user, setChosenUser] = useState("-");

  const { applications, loading, error } = useApplications(session, id);

  const sectors: Set<string> = new Set(applications.map((application: {sector: string}) => application.sector).filter((sector: string) => sector !== null));
  const cities: Set<string> = new Set(applications.map((application: {location: {city: string}}) => application.location?.city).filter((city: string) => city !== null));
  const countries: Set<string> = new Set(applications.map((application: {location: {country: string}}) => application.location?.country).filter((country: string) => country !== null));
  const regions: Set<string> = new Set(applications.map((application: {location: {region: string}}) => application.location?.region).filter((region: string) => region !== null));
  const appliedUsers: Set<string> = new Set(applications.map((application: {applied_users: string[]}) => application.applied_users).filter((applied_users: string[]) => applied_users !== null).flat());
  const creationTimes: Set<string> = new Set(applications.map((application: {creation_time: string}) => application.creation_time).filter((creation_time: string) => creation_time !== null));
  const chosenUsers: Set<string> = new Set(applications.map((application: {chosen_user: string}) => application.chosen_user).filter((chosen_user: string) => chosen_user !== null));

  if (loading) return <Card title={messages["dashboard-company-appliactions"] || "Company Applications"}>
    <Text type="secondary">Loading...</Text>
  </Card>;

  if (error) return <Card title={messages["dashboard-company-appliactions"] || "Company Applications"}>
    <Text type="secondary">{error}</Text>
  </Card>;

  return(
    <Card title={messages["dashboard-company-appliactions"] || "Company Applications"}>
      <Space direction="vertical" style={{ marginBottom: 16, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text>{messages["dashboard-applications-filter"] || "Filter applications"}</Text>
        <PrimaryButton onClick={() => {setShowFilters(!showFilters)}}>{showFilters ? messages["dashboard-hide-filters"] || "Hide filters" : messages["dashboard-show-filters"] || "Show filters"}</PrimaryButton>
      </Space>
      {showFilters && (
      <Space direction="vertical" style={{ marginBottom: 16, display: 'flex' }}>
        <Space style={{ display: 'flex', gap: 8 }}>
        <Text>{messages["dashboard-sectors"] || "Sectors"}</Text>
        <Select defaultValue="-" style={{ width: 120 }} onChange={(value) => {setSector(value as string)}}>
          <Select.Option value="-">All sectors</Select.Option>
          {Array.from(sectors).map((sector: string) => <Select.Option key={sector} value={sector}>{sector}</Select.Option>)}
        </Select>
        </Space>
        <Space style={{ display: 'flex', gap: 8 }}>
        <Text>{messages["dashboard-country"] || "Country"}</Text>
        <Select defaultValue="-" style={{ width: 120 }} onChange={(value) => {setCountry(value as string)}}>
          <Select.Option value="-">All countries</Select.Option>
          {Array.from(countries).map((country: string) => <Select.Option key={country} value={country}>{country}</Select.Option>)}
        </Select>
        </Space>
        <Space style={{ display: 'flex', gap: 8 }}>
        <Text>{messages["dashboard-region"] || "Region"}</Text>
        <Select defaultValue="-" style={{ width: 120 }} onChange={(value) => {setRegion(value as string)}}>
          <Select.Option value="-">All regions</Select.Option>
          {Array.from(regions).map((region: string) => <Select.Option key={region} value={region}>{region}</Select.Option>)}
        </Select>
        </Space>
        <Space style={{ display: 'flex', gap: 8 }}>
        <Text>{messages["dashboard-cities"] || "Cities"}</Text>
        <Select defaultValue="-" style={{ width: 120 }} onChange={(value) => {setCity(value as string)}}>
          <Select.Option value="-">All cities</Select.Option>
          {Array.from(cities).map((city: string) => <Select.Option key={city} value={city}>{city}</Select.Option>)}
        </Select>
        </Space>
        <Space style={{ display: 'flex', gap: 8 }}>
        <Text>{messages["dashboard-time"] || "Time"}</Text>
        <Space>
          <InputNumber min={0} max={24} value={maxTime} onChange={(value) => {setMaxTime(value as number)}} />
          <InputNumber min={0} max={24} value={minTime} onChange={(value) => {setMinTime(value as number)}} />
        </Space>
        </Space>
        <Space style={{ display: 'flex', gap: 8 }}>
          <Text>{messages["dashboard-weekly-hours"] || "Weekly hours"}</Text>
          <InputNumber min={0} max={40} value={weeklyHours} onChange={(value) => {setWeeklyHours(value as number)}} />
        </Space>
        <Space style={{ display: 'flex', gap: 8 }}>
          <Text>{messages["dashboard-creation-time"] || "Creation time"}</Text>
          <Select defaultValue="-" style={{ width: 120 }} onChange={(value) => {setCreationTime(value as string)}}>
            <Select.Option value="-">All creation times</Select.Option>
            {Array.from(creationTimes).map((creation_time: string) => <Select.Option key={creation_time} value={creation_time}>{creation_time}</Select.Option>)}
          </Select>
        </Space>
        <Space style={{ display: 'flex', gap: 8 }}>
          <Text>{messages["dashboard-applied-users"] || "Applied users"}</Text>
          <Select mode="multiple" allowClear style={{ width: 200 }} value={applied_users} onChange={(value) => {setAppliedUsers(value as string[])}} >
            {Array.from(appliedUsers).map((user: string) => <Select.Option key={user} value={user}>{user}</Select.Option>)}
          </Select>
        </Space>
        <Space style={{ display: 'flex', gap: 8 }}>
          <Text>{messages["dashboard-chosen-user"] || "Chosen user"}</Text>
          <Select defaultValue="-" style={{ width: 120 }} onChange={(value) => {setChosenUser(value as string)}}>
            <Select.Option value="-">No chosen user</Select.Option>
            {Array.from(chosenUsers).map((user: string) => <Select.Option key={user} value={user}>{user}</Select.Option>)}
          </Select>

        </Space>
        
        <Button type="primary" onClick={() => {setSector("-"); setCountry("-"); setRegion("-"); setCity("-"); setMaxTime(24); setMinTime(0); setWeeklyHours(40); setCreationTime("-"); setAppliedUsers([]); setChosenUser("-")}}>{messages["dashboard-reset"] || "Reset"}</Button>
      </Space>
      )}
      
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
          applied_users: string[],
          chosen_user: string,
          creation_time: string
        }) => {
          if(sector != '-' || city != '-' || country != '-' || region != '-' || minTime != 0 || maxTime != 24 || weeklyHours != 40 || creation_time != '-' || applied_users.length > 0 || chosen_user != '-')  
            return (sector != '-' ?  application.sector === sector : true) && (city != '-' ? application.location?.city === city : true) && (country != '-' ? application.location?.country === country : true) && (region != '-' ? application.location?.region === region : true) && (minTime != 0 ? application.minTime <= minTime : true) && (maxTime != 24 ? application.maxTime >= maxTime : true) && (weeklyHours != 40 ? application.weekly_hours === weeklyHours : true) && (creation_time != '-' ? application.creation_time === creation_time : true) && (applied_users.length > 0 ? application.applied_users.includes(applied_users[0]) : true) && (chosen_user != '-' ? application.chosen_user === chosen_user : true);
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
          applied_users: string[],
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

  const { applications, loading, error } = useApplications(session, id);

  if (loading) return <Card title={messages["dashboard-user-appliactions"] || "User Applications"}>
    <Text type="secondary">Loading...</Text>
  </Card>;
  
  if (error) return <Card title={messages["dashboard-user-appliactions"] || "User Applications"}>
    <Text type="secondary">{error}</Text>
  </Card>;
  
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
            applied_users: string[],
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