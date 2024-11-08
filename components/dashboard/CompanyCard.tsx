import React from 'react';
import { Card } from 'antd';
export default  function CompanyCard({ messages }: { messages: any }) {
  return(
  <Card title="Company Information">
    <p>Company Name</p>
    <p>Description of the company and mission statement</p>
  </Card>
);
}

