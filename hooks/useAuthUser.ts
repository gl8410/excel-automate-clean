import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export function useAuthUser(onSignOut?: () => void) {
    const [userEmail, setUserEmail] = useState<string>('');
    const [userCredits, setUserCredits] = useState<number | null>(null);

    const fetchCredits = async (userId: string) => {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('subscription_credits, topup_credits')
            .eq('id', userId)
            .single();
        if (!error && profile) {
            setUserCredits((profile.subscription_credits || 0) + (profile.topup_credits || 0));
        } else {
            setUserCredits(0);
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUserEmail(session.user.email ?? '');
                fetchCredits(session.user.id);
            }
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUserEmail(session.user.email ?? '');
                fetchCredits(session.user.id);
            } else {
                setUserEmail('');
                setUserCredits(null);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        if (onSignOut) onSignOut();
    };

    return {
        userEmail,
        userCredits,
        fetchCredits,
        handleSignOut,
    };
}
