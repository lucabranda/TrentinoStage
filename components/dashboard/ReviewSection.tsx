"use client";
import { Avatar, Button, Card, Input, InputNumber, Space, Spin, Pagination, Modal, Empty } from "antd";
import { useState, useEffect } from "react";
import { Text } from "@/components/Typography";
import { CloseCircleOutlined, StarFilled, UserOutlined } from "@ant-design/icons";
import { PrimaryButton } from "../buttons/Buttons";
import ProfileCard, { ProfileCompanyData, ProfileUserData } from "./ProfileCard";

interface ReviewSectionProps {
    isCompany: boolean;
    session: string;
    id: string;
    messages: any;
}

function useReviews(token: string, id: string, isACompany: boolean) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`/api/reviews?token=${token}&profileId=${id}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch reviews");
                }
                const data = await res.json();
                const values = data.map((review: any) => ({
                    _id: review._id,
                    reviewer_id: review.reviewer_id,
                    message: review.message,
                    title: review.title,
                    creation_time: review.creation_time,
                    edited: review.edited,
                    rating: review.rating,
                }));
                setReviews(values);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred while fetching reviews");
            } finally {
                setLoading(false);
            }
        };

        if (token && id) {
            fetchReviews();
        }
    }, [token, id]);

    return { reviews, loading, error };
}

const useUserProfileData = (token: string, id: string, isACompany: boolean) => {
    const [values, setValues] = useState<ProfileUserData>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const res = await fetch(`/api/profiles?token=${token}&profileId=${id}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch profile data");
                }
                const data = await res.json();
                const values = isACompany
                    ? {
                          name: data.name,
                          address: {
                              address: data.address?.address,
                              city: data.address?.city,
                              region: data.address?.region,
                              country: data.address?.country,
                              postal_code: data.address?.postal_code,
                              street: data.address?.street,
                          },
                          sector: data.sector,
                          website: data.website,
                          partitaIva: data.partitaIva,
                          profile_image: data.profile_image,
                      }
                    : {
                          name: data.name,
                          address: {
                              address: data.address?.address,
                              city: data.address?.city,
                              region: data.address?.region,
                              country: data.address?.country,
                              postal_code: data.address?.postal_code,
                              street: data.address?.street,
                          },
                          sector: data.sector,
                          surname: data.surname,
                          birth_date: data.birth_date,
                          bio: data.bio,
                          profile_image: data.profile_image,
                      };
                setValues(values as unknown as ProfileUserData );
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred while fetching profile data");
            } finally {
                setLoading(false);
            }
        };

        if (token && id) {
            fetchProfileData();
        }
    }, [token, id]);

    return { values, loading, error };
};

const ReviewCard = ({ review, messages, isCompany, session }: {
    review: {
        _id: string;
        reviewer_id: string;
        title: string;
        review: string;
        rating: number;
        creation_time: string;
        edited: boolean;
    };
    messages: any;
    isCompany: boolean;
    session: string;
}) => {
    const { values: userProfileData, loading: profileLoading, error: profileError } = useUserProfileData(session, review.reviewer_id, isCompany);
    const [showProfileCard, setShowProfileCard] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [formData, setFormData] = useState({
        title: review.title,
        review: review.review,
        rating: review.rating,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveClick = async () => {
        if (!formData.title || !formData.review) {
            console.log("Title and Review are required fields");
            return;
        }
        setIsSaving(true);
        try {
            const res = await fetch(`/api/reviews?reviewId=${review._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    review: formData.review,
                    rating: formData.rating,
                    edited: true,
                }),
            });
            if (!res.ok) {
                throw new Error("Failed to update review");
            }
            console.log(messages["success"] || "Review updated successfully");
            setShowEdit(false);
        } catch (err) {
            console.error(err instanceof Error ? err.message : "An error occurred while updating review");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Card
                key={review._id}
                title={
                    <Space>
                        <Text>{review.title}</Text>
                        {!isCompany && (
                            <PrimaryButton onClick={() => setShowEdit(true)}>{messages["edit"] || "Edit"}</PrimaryButton>
                        )}
                    </Space>
                }
                style={{ marginTop: "1rem" }}
                extra={
                    <Space>
                        <Text type="secondary">{review.creation_time.substring(0, 10)}</Text>
                        <Text>{review.rating} <StarFilled style={{ color: "gold" }} /></Text>
                    </Space>
                }
            >
                <div className="flex items-center">
                    {profileLoading ? (
                        <Spin />
                    ) : profileError ? (
                        <Text type="danger">{profileError}</Text>
                    ) : userProfileData ? (
                        <Avatar
                            onClick={() => setShowProfileCard(!showProfileCard)}
                            size={64}
                            icon={
                                userProfileData.profile_image ? (
                                    <img src={userProfileData.profile_image} alt="Profile Image" />
                                ) : (
                                    <UserOutlined />
                                )
                            }
                        />
                    ) : null}
                    <Text>{review.review}</Text>
                </div>
                <Text type="secondary">{review.edited ? messages["edited"] || "Edited" : messages["not-edited"] || "Not Edited"}</Text>
                {showEdit && (
                    <div className="mt-2">
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder={messages["title"] || "Title"}
                        />
                        <Input
                            value={formData.review}
                            onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                            placeholder={messages["review"] || "Review"}
                        />
                        <InputNumber
                            value={formData.rating}
                            onChange={(value) => setFormData({ ...formData, rating: value as number })}
                            placeholder={messages["rating"] || "Rating"}
                            min={1}
                            max={5}
                        />
                        <PrimaryButton onClick={handleSaveClick} loading={isSaving}>
                            {messages["save"] || "Save"}
                        </PrimaryButton>
                    </div>
                )}
            </Card>

            <Modal
                open={showProfileCard}
                onCancel={() => setShowProfileCard(false)}
                footer={null}
                centered
                width={800}
                bodyStyle={{ padding: "1rem" }}
            >
                {userProfileData && (
                    <ProfileCard
                        session={session}
                        messages={messages}
                        isCompany={false}
                        isOwner={false}
                        profileData={userProfileData as ProfileUserData}
                        id={review.reviewer_id}
                    />
                )}
            </Modal>
        </>
    );
};

export default function ReviewSection({ isCompany, session, id, messages }: ReviewSectionProps) {
    const { reviews, loading, error } = useReviews(session, id, isCompany);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const paginatedReviews = reviews.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <Card style={{ marginTop: "1rem" }} title={messages["reviews-title"] || "Reviews"}>
            {loading ? (
                <Spin />
            ) : error ? (
                <Text type="danger">{error}</Text>
            ) : reviews.length > 0 ? (
                <>
                    {paginatedReviews.map((review) => (
                        <ReviewCard
                            key={review._id}
                            review={review}
                            messages={messages}
                            isCompany={isCompany}
                            session={session}
                        />
                    ))}
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={reviews.length}
                        onChange={(page) => setCurrentPage(page)}
                        style={{ marginTop: "1rem", textAlign: "center" }}
                    />
                </>
            ) : (
                <Text className="text-center">
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> {messages["no-reviews"] || "No reviews available"}
                </Text>
            )}
        </Card>
    );
}
