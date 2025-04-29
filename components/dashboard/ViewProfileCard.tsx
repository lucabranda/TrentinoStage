import styles from "@/app/(pages)/[lang]/profile/[profile_id]/profile.module.css";
import ProfileCard, {ProfileCompanyData, ProfileUserData} from "@/components/dashboard/ProfileCard";

export default async function ViewProfileCard({token, profile_id, messages, isACompany}: any) {
    const queryParams = new URLSearchParams({ token, profileId: profile_id });
    const response = await fetch(`/api/profiles?${queryParams.toString()}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!response.ok) {
        throw new Error(`Errore nella richiesta: ${response.statusText}`);
    }
    const profileData = await response.json();

    const values = (isACompany ? {
        name: profileData!.name,
        address: {
            address: profileData!.address?.address,
            city: profileData!.address?.city,
            region: profileData!.address?.region,
            country: profileData!.address?.country,
            postal_code: profileData!.address?.postalCode,
            street: profileData!.address?.street
        },
        sector: profileData!.sector,
        website: profileData!.website,
        partitaIva: profileData!.identifier
    } as ProfileCompanyData : { 
        name: profileData!.name,
        surname: profileData!.surname,
        bio: profileData!.bio,
        birth_date: profileData!.birth_date,
        address: {
            address: profileData!.address?.address,
            city: profileData!.address?.city,
            region: profileData!.address?.region,
            country: profileData!.address?.country,
            postal_code: profileData!.address?.postalCode,
            street: profileData!.address?.street
        },
        sector: profileData!.sector,
        website: profileData!.website
    } as ProfileUserData)
    return (
        <>
            <div className={styles.profileCardContainer}>
                <ProfileCard isCompany={isACompany} profileData={(values) as ProfileUserData | ProfileCompanyData}
                             session={token} id={profile_id} messages={messages} isOwner={false}></ProfileCard>
            </div>
        </>
    )
}