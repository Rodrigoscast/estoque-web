"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const [verified, setVerified] = useState(false);

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
      } else {
        setVerified(true);
      }
    }, [router]);

    if (!verified) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
