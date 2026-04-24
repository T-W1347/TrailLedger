import { Session } from "@supabase/supabase-js";
import { createContext, ReactNode, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type AuthContextType = {
    session: Session | null;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: {children: ReactNode}) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect (() => {

        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        })

        const { data: listener} = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setLoading(false);
            }
        )

        return () =>{
            listener.subscription.unsubscribe();
        };
    }, [])


    return (
        <AuthContext.Provider value ={{ session, loading }}>
            {children}
        </AuthContext.Provider>
    )
}