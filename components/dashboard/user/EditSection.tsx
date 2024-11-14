"use client"
import React, { useState } from 'react';
import { Card, Form, Input, Button, Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const {Item} = Form;

export default function EditSection({ messages }: { messages: any }) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  });

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const getBase64 = (img: any, callback: any) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const beforeUpload = (file: any) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const handleChange = (info: any) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, (url: any) =>
        setImageUrl(url),
      );
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  return(
    <Card title="Edit Profile">
      <Form layout="vertical">
        <Item label="Name">
          <Input placeholder="Enter your name" name="name" onChange={handleFormChange} />
        </Item>
        <Item label="Email">
          <Input placeholder="Enter your email" name="email" onChange={handleFormChange} />
        </Item>
        <Item label="Profile Picture">
          <Form.Item name="avatar" valuePropName="fileList" getValueFromEvent={normFile}>
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              beforeUpload={beforeUpload}
              onChange={handleChange}
            >
              {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
            </Upload>
          </Form.Item>
        </Item>
        <Button type="primary" onClick={() => console.log(profileData)}>{messages["dashboard-button-update"]}</Button>
      </Form>
    </Card>
  );
};

