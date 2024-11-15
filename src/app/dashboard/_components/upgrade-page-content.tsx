'use client';
import { Plan } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FC } from 'react';

interface UpgradePageContentProps {
  plan: Plan
}

export const UpgradePageContent: FC<UpgradePageContentProps> = ({plan}) => {
  const router = useRouter();
  const {} = useMutation({
    //TODO: Payment session logics
  })
  return(
    <div className=''>
      UpgradePageContent
    </div>
  );
};
