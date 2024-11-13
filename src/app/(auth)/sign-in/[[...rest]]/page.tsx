'use client';
import { SignIn } from '@clerk/nextjs';
import { FC } from 'react';

const SignInPage: FC = () => {
  return(
    <div className='w-full flex-1 flex items-center justify-center '>
      <SignIn/>
    </div>
  );
};

export default SignInPage;
