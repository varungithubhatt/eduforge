'use client'
import React, { use, useEffect, useState } from 'react'
import axios from 'axios';
import { User } from 'lucide-react';
import { UserDetailContext } from '@/context/UserDetailContext';
import { set } from 'date-fns';
const Provider = ({children}:{children:React.ReactNode}) => {

    const [userdetail,setUserDetail] = useState(null);

    useEffect(()=>{
        CreateUser();
    },[])

   const CreateUser = async () =>{
    const result = await axios.post('/api/user',{});
    console.log(result.data);
    setUserDetail(result.data);
   } 
  return (
    <div>
        <UserDetailContext.Provider value={{userdetail,setUserDetail}}>
        {children}
        </UserDetailContext.Provider>
    </div>
  )
} 

export default Provider