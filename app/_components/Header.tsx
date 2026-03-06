'use client'

import React from 'react'
import Image from 'next/image';
import { useUser } from '@clerk/shared/react/index';
import { Sign } from 'crypto';
import { SignInButton, UserButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import Link from 'next/dist/client/link';
const Header = () => {
    const {user} = useUser();
  return (
    <div className='flex items-center justify-between p-4'>
        <Link href={'/'}> 
        <div className='flex gap-2 items-center'>
            <Image src={'/logo.png'} alt="Logo" width={45} height={45} />
            <h2 className='text-xl font-bold '><span className='text-primary'>Vid</span>Course</h2>
        </div>
        </Link>

        <ul className='flex gap-8 items-center'>
           <Link href={'/'}> <li className='text-lg hover:text-primary font-medium cursor-pointer'>Home</li></Link>

            <Link href={'/pricing'}><li className='text-lg hover:text-primary font-medium cursor-pointer'>Pricing</li> </Link>
        </ul>
        {user?
        <UserButton />:
        <SignInButton mode = 'modal'>
            <Button>Get Started</Button>
            </SignInButton>

        }

    </div>
  )
}

export default Header