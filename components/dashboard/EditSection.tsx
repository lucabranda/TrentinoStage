"use client";
import React, { useState } from 'react';
import { Card, Avatar, Space, Row, Col, Typography, Button, Badge, Form, Input, Carousel, DatePicker } from 'antd';
import { Title, Text, Paragraph } from '@/components/Typography';
import { EditOutlined, CheckOutlined } from '@ant-design/icons';
const EditableField: React.FC<{
  label: string;
  inputType?: "text" | "password" | "textarea" | "file" | "date";
  maxLength?: number;
  initialValue?: string;
  onSave?: (value: string) => void;
}> = ({ label, inputType = "text", maxLength, initialValue = "", onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  const handleSave = () => {
    if (value.trim() === "") return; // Don't save empty values
    setIsEditing(false);
    onSave?.(value);
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Maximum size is 5MB");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file type. Please upload JPEG, PNG or PDF");
      return;
    }

    try {
      // Here you would typically upload the file to your server
      // For now just set the filename
      setValue(file.name);
      handleSave();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    }
  };

  if (inputType === "file") {
    return (
      <Form.Item label={label}>
        <Space>
          <Typography.Text>{value || "Not set"}</Typography.Text>
          <label>
            <Button 
              type="link"
              icon={<EditOutlined />}
              onClick={() => document.getElementById(`file-${label}`)?.click()}
            />
            <input
              id={`file-${label}`}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </label>
        </Space>
      </Form.Item>
    );
  }

  const InputComponent =
    inputType === "password"
      ? Input.Password
      : inputType === "textarea"
      ? Input.TextArea
      : inputType === "date"
      ? DatePicker
      : Input;

  return (
    <Form.Item label={label}>
      <Space>
        {!isEditing ? (
          <Typography.Text>{value || "Not set"}</Typography.Text>
        ) : (
          <InputComponent
            value={value}
            onChange={(e) => setValue(
              inputType === "date" 
                ? (e as any).format("YYYY-MM-DD")
                : (e as React.ChangeEvent<HTMLInputElement>).target.value
            )}
            showCount={maxLength !== undefined}
            maxLength={maxLength}
            autoFocus
            onPressEnter={handleSave}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                handleCancel();
              }
            }}
          />
        )}
        <Space>
          {isEditing ? (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={handleSave}
                aria-label={`Save ${label}`}
              />
              <Button
                type="link"
                danger
                onClick={handleCancel}
                aria-label={`Cancel editing ${label}`}
              >
                ✕
              </Button>
            </>
          ) : (
            <Button
              type="link" 
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
              aria-label={`Edit ${label}`}
            />
          )}
        </Space>
      </Space>
    </Form.Item>
  );
};
  
export default function EditSection({ fields, messages }: {fields: any, messages: any}) {
  
  return (
    <>
      {fields.map((field: any) => (
        <EditableField
          key={field.name}
          label={field.label}
          inputType={field.type} 
          maxLength={field.maxLength}
        />
      ))}
    </>
  );
}





/*
"use client"
import React, { useState } from 'react';
import { Card, Form, Input, Button, Upload, message, Image } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const {Item} = Form;

export default function EditSection({ messages }: { messages: any }) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
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
    <Card title="Edit Profile" style={{ width: '100%' }}>
      <Form layout="vertical">
        <Item label="Name">
          <Input placeholder="Enter your name" name="name" onChange={handleFormChange} />
        </Item>
        <Item label="Email">
          <Input placeholder="Enter your email" name="email" onChange={handleFormChange} />
        </Item>
        <Item label="Bio">
          <Input.TextArea placeholder="Enter your bio" name="bio" onChange={handleFormChange} />
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
              {imageUrl ? <Image src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
            </Upload>
          </Form.Item>
        </Item>
        <Button type="primary" onClick={() => console.log(profileData)}>{messages["dashboard-button-update"]}</Button>
      </Form>
    </Card>
  );
};

*/