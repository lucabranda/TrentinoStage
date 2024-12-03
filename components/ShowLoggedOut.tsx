"use client"

import { getSessionToken } from "@/utils/cookie";

export default async function ShowLoggedOut({ children }: any) {
  const isLoggedIn = await getSessionToken();

  return (
    <>
    {isLoggedIn ? null : (

        <>
          {children}
        </>
      )
    }
    </>
    );
};
