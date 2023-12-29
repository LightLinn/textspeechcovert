'use client'

import Image from 'next/image'
import Main from '@/components/main/Main'
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  if (!isLoggedIn){
    router.push('/login')
  }

  return (
    <div>
      <Main />
    </div>
  )
}
