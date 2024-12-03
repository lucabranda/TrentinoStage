"use client"

import { getSessionToken } from "@/utils/cookie";

export default async function ShowLoggedIn({ children }: any) {
  const isLoggedIn = await getSessionToken();

  return (
    <>
    {isLoggedIn ? (
        <>
          {children}
        </>
      ) : null
    }
    </>
    );
};
