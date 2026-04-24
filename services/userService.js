import { supabase } from '..lib/supabase'

export const getUserProfile = async (userID) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userID)
        .single()

    if (error) throw error
    return data
}