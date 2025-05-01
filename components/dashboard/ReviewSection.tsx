"use client"
import {Avatar, Button, Card, Carousel, Input, InputNumber, Space, Spin} from "antd";
import { useState, useEffect } from "react";
import { Text } from "@/components/Typography";
import { CloseCircleOutlined, StarFilled, UserOutlined } from "@ant-design/icons";
import { Empty } from 'antd';
import { PrimaryButton } from "../buttons/Buttons";
import ProfileCard, { ProfileUserData } from "./ProfileCard";

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
                const res = await fetch(`/api/reviews/get?token=${token}&profileId=${id}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch reviews');
                }
                const data = await res.json();
                const values = data.map((review: any) => ({
                    _id: review._id,
                    reviewer_id: review.reviewer_id,
                    message: review.message,
                    title: review.title,
                    creation_time: review.creation_time,
                    edited: review.edited,
                    rating: review.rating
                }));
                setReviews(values);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching reviews');
                setLoading(false);
            }
        };

        if (token && id) {
            fetchReviews();
        }
    }, [token, id]);

    return { reviews, loading, error };
}

const ReviewCard = ({review, messages, isCompany, session}: {review: {
    _id: string;
    reviewer_id: string;
    title: string;
    review: string;
    rating: number;
    creation_time: string;
    edited: boolean;
}, messages: any, isCompany: boolean, session: string}) => {
    const [showProfileCard, setShowProfileCard] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
    const [formData, setFormData] = useState<{
        title: string;
        review: string;
        rating: number;
    }>({
        title: review.title,
        review: review.review,
        rating: review.rating
    });

    const handleEditClick = (field: string, b: boolean) => {
        setIsEditing((prev) => ({...prev, [field]: b}));
    };

    const handleSaveClick = async () => {
        if (!formData.title || !formData.review) {
            console.log("Title and Review are required fields");
            return;
        }
        try {
            const res = await fetch(`/api/reviews/update?reviewId=${review._id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    title: formData.title,
                    review: formData.review,
                    rating: formData.rating,
                    edited: true
                })
            });
            if (!res.ok) {
                throw new Error('Failed to update review');
            }
            console.log(messages["success"] || "Review updated successfully");
            setIsEditing({});
            setShowEdit(false);
        } catch (err) {
            console.error(err instanceof Error ? err.message : 'An error occurred while updating review');
        }
    };


    const userProfileData = useUserProfileData(session, review.reviewer_id, isCompany);

    return (
        <>
        <Card
            key={review.reviewer_id}
            title={
                <Space>
                    <Text>{review.title}</Text>
                    {!isCompany && (
                        <PrimaryButton onClick={() => setShowEdit(true)}>{messages["edit"]}</PrimaryButton>
                    )}
                </Space>
            }
            style={{marginTop: "1rem"}}
            extra={
                <Space>
                    <Text type="secondary">{review.creation_time.substring(0, 10)}</Text>
                    <Text >{review.rating} <StarFilled style={{color: "gold"}} /></Text>
                </Space>
            }
        >
            <div className="flex items-center">
                {userProfileData && (
                    <Avatar onClick={() => setShowProfileCard(!showProfileCard)} size={40} src={userProfileData?.profile_image || ""} />
                )}
                <Text>{review.review}</Text>
            </div>
            <Text type="secondary">{review.edited ? messages["edited"] : messages["not-edited"]}</Text>
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
                    />
                    <PrimaryButton onClick={handleSaveClick}>{messages["save"] || "Save"}</PrimaryButton>
                </div>
            )}
        </Card>

        {showProfileCard && (
                <div style={{
                   position: 'fixed',
                   alignSelf: 'center',
                   justifyContent: 'center',
                   alignItems: 'center',
                   top: 0,
                   left: 0,
                   width: '100%',
                   height: '100vh',
                   backgroundColor: 'rgba(0,0,0,0.5)',
                   zIndex: 1000,
                }}
                >

                    <ProfileCard session={session} messages={messages} isCompany={false} isOwner={false} profileData={userProfileData as ProfileUserData} id={review.reviewer_id} closeButton={ (<Button onClick={() => setShowProfileCard(false)}
                                                                                                                                                                           style={{border: 'none'}}><CloseCircleOutlined/></Button>)}/>
                </div>
            )}
        </>
    )
}


export default function ReviewSection({isCompany, session, id, messages}: ReviewSectionProps) {
    const { reviews, loading, error } = useReviews(session, id, isCompany);
    return (
        <Card className="w-full" style={{ marginTop: "1rem"}} title={messages["reviews-title"] || "Reviews"}>
            {loading ? (
                <Spin />
            ) : (
                reviews.length > 0 ? (
            <Carousel autoplay className="w-full" style={{ display: "flex",justifyContent:"space-between"}}>
                {reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} messages={messages} isCompany={isCompany} session={session}/>
                ))}
            </Carousel>
        ) : (
            
            <Text className="text-center"><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> {messages["no-reviews"]}</Text>
        )   )}
        </Card>
    )
}

const useUserProfileData = (token: string, id: string, isACompany: boolean) => {
    const [values, setValues] = useState<ProfileUserData>();

    useEffect(() => {
        const fetchProfileData = async () => {
            const res = await fetch(`/api/profiles/get?token=${token}&profileId=${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch profile data');
            }

            const data = await res.json();
            const values = (isACompany ? {
                name: data.name,
                address: {
                    address: data.address,
                    city: data.city,
                    region: data.region,
                    country: data.country,
                    postal_code: data.postal_code,
                    street: data.street
                },
                sector: data.sector,
                website: data.website,
                partitaIva: data.partitaIva,
                profile_image: data.profile_image
            } : {
                name: data.name,
                address: {
                    address: data.address,
                    city: data.city,
                    region: data.region,
                    country: data.country,
                    postal_code: data.postal_code,
                    street: data.street
                },
                sector: data.sector,
                surname: data.surname,
                birth_date: data.birth_date,
                bio: data.bio,
                profile_image: data.profile_image
            });
            setValues(values as ProfileUserData );
        };

        if (token && id) {
            fetchProfileData();
        }
    }, [token, id]);

    return values;
};