import React from 'react';
import { Card, Row, Col, Button } from 'antd';

export default  function CompanyCard({ messages }: { messages: any }) {
  return(
    <Card title="Company Information">
      <Row gutter={16}>
        <Col span={12}>
          <p>Company Name
            Description of the company and mission statement</p>
        </Col>
        <Col span={12}>
          <Button type="primary">Show More</Button>
        </Col>
      </Row>
    </Card>
  );
}

