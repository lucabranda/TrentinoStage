import styles from "@/app/(pages)/[lang]/profile/[profile_id]/profile.module.css";
import ProfileCard, {ProfileCompanyData, ProfileUserData} from "@/components/dashboard/ProfileCard";
import {ProfilesApi} from "@/api/profilesApi";


export default async function ViewProfileCard({token, profile_id, messages, isACompany}: any) {
    const profilesApi = new ProfilesApi();
    var _profileData = await profilesApi.apiProfilesGetGet(token, profile_id);
    var profileData = _profileData.body;

    const values = (isACompany ? {
        name: profileData!.name,
        address: {
            address: profileData!.address?.address,
            city: profileData!.address?.city,
            region: profileData!.address?.region,
            country: profileData!.address?.country,
            postalCode: profileData!.address?.postalCode
        },
        sector: profileData!.sector,
        website: profileData!.website
        //partitaIva: profileData!.partitaIva
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
            postalCode: profileData!.address?.postalCode
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