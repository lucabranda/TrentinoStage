"use client";
import { isLoggedIn, checkSessionToken } from "@/utils/session";
import {getMessages} from "@/utils/systemMessage";
import {Button, Form, Input, Space, message, Typography, Card} from 'antd';
import React, {useState} from 'react';
import { isCompany } from "@/utils/accounts";
export default async function NewProfileForm({messages, styles, isCompany}: {messages: any, styles: any, isCompany: boolean}) {
    const msgs = await getMessages(messages.lang);

    return (
        <Card className={styles.formNewProfile}>
                <Form
                    name="create-profile"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ maxWidth: 600 }}
                    initialValues={{ remember: true }}
                    autoComplete="off"
                    className={styles.form}
                >
                    <Form.Item
                        label={<span className={styles.formLabel}>{msgs["user-card-name-label"]}</span>}
                        name="name"
                        rules={[{ required: true, message: msgs["error-name-not-provided"] }]}
                    >
                        <Input className={styles.formInput} />
                    </Form.Item>
                    {!isCompany && 
                    <Form.Item
                        label={<span className={styles.formLabel}>{msgs["user-card-surname-label"]}</span>}
                        name="surname"
                        rules={[{ required: true, message: msgs["error-surname-not-provided"] }]}
                    >
                        <Input className={styles.formInput} />
                    </Form.Item>
                    }
                   
                    <Form.Item
                        label={<span className={styles.formLabel}>{msgs["user-card-bio-label"]}</span>}
                        name="bio"
                        rules={[{ required: true, message: msgs["error-bio-not-provided"] }]}
                    >
                        <Input.TextArea className={styles.formInput} />
                    </Form.Item>

                    <Form.Item
                        label={<span className={styles.formLabel}>{msgs["user-card-country-label"]}</span>}
                        name="country"
                        rules={[{ required: true, message: msgs["error-country-not-provided"] }]}
                    >
                        <Input className={styles.formInput} />
                    </Form.Item>

                    <Form.Item
                        label={<span className={styles.formLabel}>{msgs["user-card-region-label"]}</span>}
                        name="region"
                        rules={[{ required: true, message: msgs["error-region-not-provided"] }]}
                    >
                        <Input className={styles.formInput} />
                    </Form.Item>

                    <Form.Item
                        label={<span className={styles.formLabel}>{msgs["user-card-city-label"]}</span>}
                        name="city"
                        rules={[{ required: true, message: msgs["error-city-not-provided"] }]}
                    >
                        <Input className={styles.formInput} />
                    </Form.Item>

                    <Form.Item
                        label={<span className={styles.formLabel}>{msgs["user-card-postalCode-label"]}</span>}
                        name="postalCode"
                        rules={[{ required: true, message: msgs["error-postalCode-not-provided"] }]}
                    >
                        <Input className={styles.formInput} type="number"/>
                    </Form.Item>

                    <Form.Item
                        label={<span className={styles.formLabel}>{msgs["user-card-street-label"]}</span>}
                        name="street"
                        rules={[{ required: true, message: msgs["error-street-not-provided"] }]}
                    >
                        <Input className={styles.formInput} />
                    </Form.Item>

                    <Form.Item
                        label={<span className={styles.formLabel}>{msgs["user-card-address-label"]}</span>}
                        name="address"
                        rules={[{ required: true, message: msgs["error-address-not-provided"] }]}
                    >
                        <Input className={styles.formInput} />
                    </Form.Item>


                    <Form.Item
                        label={<span className={styles.formLabel}>{msgs["user-card-sector-label"]}</span>}
                        name="sector"
                        rules={[{ required: true, message: msgs["error-sector-not-provided"] }]}
                    >
                        <Input className={styles.formInput} />
                    </Form.Item>
                    {isCompany && 
                    <>
                        <Form.Item
                            label={<span className={styles.formLabel}>{msgs["user-card-vat-label"]}</span>}
                            name="vat"
                            rules={[{ required: true, message: msgs["error-vat-not-provided"] }]}
                        >
                            <Input className={styles.formInput} />
                        </Form.Item>

                        <Form.Item
                           label={<span className={styles.formLabel}>{msgs["user-card-website-label"]}</span>}
                           name="website"
                           rules={[{ required: true, message: msgs["error-website-not-provided"] }]}
                       >
                           <Input className={styles.formInput} />
                       </Form.Item>
                    </>
                    }

                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type="primary" htmlType="submit" className={styles.formButton}>
                            {msgs["user-card-submit-button"]}
                        </Button>
                    </Form.Item>
                </Form>
        </Card>
    );
}