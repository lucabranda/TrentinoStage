"use client";
import React, {useEffect, useState} from 'react'
import {Button, Form, Input, Typography, Card, Upload, Layout, Select, DatePicker} from 'antd';
import {SendOutlined, UploadOutlined} from "@ant-design/icons";
import {sectors, countries, regions, cities} from "@/utils/enums";

export interface NewProfileFormProps {
    token: string,
    msgs: any,
    styles: any,
    isCompany: boolean
}


export default function NewProfileForm({token, msgs, styles, isCompany}: NewProfileFormProps) {


    const onFinish = async (values: any) => {
        try {
            const name = values.name;
            const address = values.address;
            const city = values.city;
            const postal_code = values.postal_code;
            const street = values.street;
            const region = values.region;
            const country = values.country;
            //const sector = "{\"sector\":\"" + values.sector + "\"}";
            const sector = JSON.stringify(values?.sector);
            const bio = values.bio;
            const birth_date = values?.birth_date || undefined;
            const identifier = values?.identifier;
            const profile_picture = values.profile_picture?.file?.thumbUrl || undefined;

            const website = (isCompany) && values?.website;
            const surname = (!isCompany) && values?.surname;

            const res = await fetch(`/api/profiles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    token: token,
                    is_company: isCompany,
                    name: name,
                    address: address,
                    city: city,
                    postal_code: postal_code,
                    region: region,
                    country: country,
                    sector: sector,
                    street: street,
                    bio: bio,
                    birth_date: birth_date,
                    profile_picture: profile_picture,
                    identifier: identifier,
                    ...(isCompany && {website: website}),
                    ...(!isCompany && {surname: surname})
                }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(
                    
                    errorData.error
                );
            }


        } catch (error) {
            // Handle error case
            console.error("Error creating profile:", error);
            // Optionally show an error message to the user
        }
    
        window.location.href = "/dashboard";
    };

    const fields = isCompany ? [
        {
            label: <span className={styles.formLabel}>{msgs["company-card-name-label"]}</span>,
            name: "name",
            rules: [{required: true, message: msgs["error-name-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-country-label"]}</span>,
            name: "country",
            rules: [{required: true, message: msgs["error-country-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-region-label"]}</span>,
            name: "region",
            rules: [{required: true, message: msgs["error-region-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-city-label"]}</span>,
            name: "city",
            rules: [{required: true, message: msgs["error-city-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-street-label"]}</span>,
            name: "street",
            rules: [{required: true, message: msgs["error-street-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-postal_code-label"]}</span>,
            name: "postal_code",
            rules: [{required: true, message: msgs["error-postal_code-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-address-label"]}</span>,
            name: "address",
            rules: [{required: true, message: msgs["error-address-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-partita-iva-label"]}</span>,
            name: "partitaIva",
            rules: [{required: true, message: msgs["error-partita-iva-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-profile-picture-label"]}</span>,
            name: "profile_picture",
            rules: [{required: false, message: msgs["error-profile-picture-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["user-card-birth-date-label"]}</span>,
            name: "birth_date",
            rules: [{required: false, message: msgs["error-birth-date-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-bio-label"]}</span>,
            name: "bio",
            rules: [{required: false, message: msgs["error-bio-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-website-label"]}</span>,
            name: "website",
            rules: [{required: false, message: msgs["error-website-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-sector-label"]}</span>,
            name: "sector",
            rules: [{required: false, message: msgs["error-sector-not-provided"]}]
        },
    ] : [
        {
            label: <span className={styles.formLabel}>{msgs["user-card-name-label"]}</span>,
            name: "name",
            rules: [{required: true, message: msgs["error-name-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["user-card-surname-label"]}</span>,
            name: "surname",
            rules: [{required: true, message: msgs["error-surname-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["user-card-identifier-label"]}</span>,
            name: "identifier",
            rules: [{required: true, message: msgs["error-identifier-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["user-card-bio-label"]}</span>,
            name: "bio",
            rules: [{required: false, message: msgs["error-bio-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-country-label"]}</span>,
            name: "country",
            rules: [{required: true, message: msgs["error-country-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-region-label"]}</span>,
            name: "region",
            rules: [{required: true, message: msgs["error-region-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-city-label"]}</span>,
            name: "city",
            rules: [{required: true, message: msgs["error-city-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-street-label"]}</span>,
            name: "street",
            rules: [{required: true, message: msgs["error-street-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-postal_code-label"]}</span>,
            name: "postal_code",
            rules: [{required: true, message: msgs["error-postal_code-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["company-card-address-label"]}</span>,
            name: "address",
            rules: [{required: true, message: msgs["error-address-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["user-card-profile-picture-label"]}</span>,
            name: "profile_picture",
            rules: [{required: false, message: msgs["error-profile-picture-not-provided"]}]
        },
        {
            label: <span className={styles.formLabel}>{msgs["user-card-birth-date-label"]}</span>,
            name: "birth_date",
            rules: [{required: false, message: msgs["error-birth-date-not-provided"]}]
        }/*,
        {
            label: <span className={styles.formLabel}>{msgs["user-card-cv-label"]}</span>,
            name: "cv",
            rules: [{required: false, message: msgs["error-cv-not-provided"]}]
        }*/,
        {
            label: <span className={styles.formLabel}>{msgs["user-card-sector-label"]}</span>,
            name: "sector",
            rules: [{required: false, message: msgs["error-sector-not-provided"]}]
        },
    ];

    const [country, setCountry] = useState("ITALY");
    useEffect(() => {
        setCountry((document.getElementById("country") as HTMLSelectElement).value);
    }, []);
    const [region, setRegion] = useState("TRENTINOALTOADIGE");
    useEffect(() => {
        setRegion((document.getElementById("region") as HTMLSelectElement).value);
    }, []);
    return (
        <Layout style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh"
        }}>

            <Card className={styles.formNewProfile}>
                <Form
                    name="create-profile"
                    labelCol={{span: 8}}
                    wrapperCol={{span: 16}}
                    style={{maxWidth: 600}}
                    initialValues={{remember: true}}
                    autoComplete="off"
                    className={styles.form}
                    onFinish={onFinish}
                    title={msgs["new-profile-title"] || "Create Profile"}
                >
                    <Form.Item>
                        <Typography.Title level={3} className={styles.formTitle}>
                            {msgs["new-profile-title"] || "Create Profile"}
                        </Typography.Title>
                    </Form.Item>
                    {fields.map(field => (
                        <Form.Item
                            key={field.name}
                            label={field.label}
                            name={field.name}
                            rules={field.rules}
                            className={styles.formItem}
                        >
                            {field.name === "profile_picture" /*|| field.name === "cv"*/ ? (
                                <Upload
                                    name={field.name}
                                    listType="picture"
                                    maxCount={1}
                                >
                                    <Button icon={<UploadOutlined/>} style={{width: "100%"}}>Upload</Button>
                                </Upload>
                            ) : field.name === "bio" ? (
                                <Input.TextArea className={styles.formTextArea}/>
                            ) : field.name === "sector" ? (
                                <Select
                                    className={styles.formSelect}
                                    placeholder={msgs["select-default"] || "---"}
                                    id="sector"
                                >
                                    {Object.entries(sectors).map(([key, label]) => (
                                        <Select.Option key={key} value={key}>
                                            {msgs[`enum-sector-${key}`]}
                                        </Select.Option>
                                    ))}
                                </Select>
                            ) : field.name === "birth_date" ? (
                                <DatePicker
                                    className={styles.formInput}
                                    format="DD/MM/YYYY"
                                    placeholder={msgs["select-default"] || "---"}
                                />
                            ) : field.name === "country" ? (
                                <Select
                                    className={styles.formSelect}
                                    placeholder={msgs["select-default"] || "---"}
                                    id="country"
                                    onChange={(value) => setCountry(value)}
                                >
                                    {Object.entries(countries).map(([key, label]) => (
                                        <Select.Option key={key} value={key}>
                                            {msgs[`enum-country-${key}`]}
                                        </Select.Option>
                                    ))}
                                </Select>
                            ) : field.name === "region" ? (
                                country === "ITALY" ? (
                                    <Select
                                        className={styles.formSelect}
                                        placeholder={msgs["select-default"] || "---"}
                                        id="region"
                                        onChange={(value) => setRegion(value)}
                                    >
                                        {Object.entries(regions).map(([key, label]) => (
                                            <Select.Option key={key} value={key}>
                                                {msgs[`enum-region-${key}`]}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                ) : (
                                    <Input className={styles.formInput}/>
                                )

                            ) : field.name === "city"  && region === "TRENTINOALTOADIGE" ? (
                                <Select
                                    className={styles.formSelect}
                                    placeholder={msgs["select-default"] || "---"}
                                    id="city"
                                >
                                    {Object.entries(cities).map(([key, label]) => (
                                        <Select.Option key={key} value={key}>
                                            {cities[key as keyof typeof cities] as string}
                                        </Select.Option>
                                    ))}
                                </Select>
                            ) : (
                                <Input className={styles.formInput}/>
                            )}

                        </Form.Item>
                    ))}

                    <Form.Item wrapperCol={{offset: 8, span: 16}}>
                        <Button type="primary" htmlType="submit" className={styles.formButton}>
                            {msgs["user-card-submit-button"]}<SendOutlined/>
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Layout>
    );
}

