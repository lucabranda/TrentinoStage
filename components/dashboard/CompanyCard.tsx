"use client";
import React, { useEffect, useState } from "react";
import { Card, Carousel, Spin } from "antd";
import EditSection from "./EditSection";

interface CompanyCardProps {
  session: string;
  id: string | number;
  messages: Record<string, string>;
}

interface ProfileData {
  name?: string;
  address?: string;
  partitaIva?: string;
  profilePicture?: string;
  bio?: string;
  website?: string;
  sector?: string;
}

export default function CompanyCard({ session, id, messages }: CompanyCardProps) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`/api/profiles/get?session=${session}&id=${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch profile data.");
        }
        const data = await res.json();
        setData(data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [session, id]);

  const companyFields = [
    {
      value: data?.name,
      label: messages["company-card-name-label"],
      type: "text",
      maxLength: 50,
    },
    {
      value: data?.address,
      label: messages["company-card-address-label"],
      type: "text",
      maxLength: 200,
    },
    {
      value: data?.partitaIva,
      label: messages["company-card-partita-iva-label"],
      type: "text",
      maxLength: 11,
    },
    {
      value: data?.profilePicture,
      label: messages["company-card-profile-picture-label"],
      type: "file",
    },
    {
      value: data?.bio,
      label: messages["company-card-bio-label"],
      type: "text",
      maxLength: 200,
    },
    {
      value: data?.website,
      label: messages["company-card-website-label"],
      type: "text",
      maxLength: 100,
    },
    {
      value: data?.sector,
      label: messages["company-card-sector-label"],
      type: "text",
      maxLength: 50,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spin tip={messages["loading-text"] || "Loading..."} />
      </div>
    );
  }

  return (
    <>
      <Card title={messages["company-card-title-team"]}>
        <Carousel autoplay>
          {["Employee 1", "Employee 2", "Employee 3"].map((employee, index) => (
            <div key={index}>
              <p>{employee}</p>
            </div>
          ))}
        </Carousel>
      </Card>
      <Card>
        <EditSection fields={companyFields} messages={messages} />
      </Card>
      
    </>
  );
}
