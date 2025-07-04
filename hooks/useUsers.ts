import {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";


interface UseusersOptions {
    includeKeywords?: boolean;
}
interface User {
    id: string;
    name?:string;
    description?: string;
    address?: string;
    phone_number?: string;
    user_type: 'user';
    created_at: string;
    user_info?: {
        id: string;
        age?: number;
        gender?: string;
        nationality?: string;
        visa?: string;
        korean_level?: string;
        how_long?: string;
        experience?: string;
    }
}
interface UserWithKeywords extends User{
    user_keywords?: {
        keyword_id: number;
        keyword: {
            id: number;
            keyword: string;
            category: string;
        };
    }[];
}



export const useUsers = (option?: UseusersOptions) => {
    const [users, setUsers] = useState<UserWithKeywords[]>([]);
    const [loading, setLoading] = useState(true);


    // 유저 목록 가져오기
    const fetchUsers = async () => {
        try {

            if(option?.includeKeywords) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select(`
                          *,
                          user_info!user_info_user_id_fkey(
                            id, age, gender, nationality, visa, korean_level, how_long, experience
                          ),
                          user_keywords:user_keyword(
                                keyword_id,
                                keyword:keyword_id(
                                    id,
                                    keyword,
                                    category
                                )
                          )
                    `)
                    .eq('user_type', 'user')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('유저 정보 조회 실패:', error);
                    return;
                }
                if (data) {
                    setUsers(data as UserWithKeywords[]);
                }
            } else {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_type', 'user')
                    .order('created_at', { ascending: false });

                if(error) {
                    console.error('유저정보 조회실패(keywordX):', error);
                    return;
                }
                if(data) {
                    setUsers(data as UserWithKeywords[]);
                }
            }
        } catch (error) {
            console.error('유저 목록 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    return {
        users,
        loading,
        fetchUsers,
    }



}