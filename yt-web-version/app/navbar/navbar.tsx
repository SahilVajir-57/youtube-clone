'use client';

import Image from 'next/image';
import styles from './navbar.module.css';
import Link from 'next/link';
import SignIn from './sign-in';
import { onAuthStateChangedHelper } from '../firebase/firebase';
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import Upload from './upload';

export default function Navbar(){
    const [user, setUser] = useState<User| null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChangedHelper((user) =>{
            setUser(user);
        });

        return () => unsubscribe();
    },[]);



    return (
        <div className={styles.div}>
            <Link href="/">
                <Image width={90} height={20} src="/youtube-logo.svg"  alt="YouTube Logo" />
            </Link>
            {
                user &&  <Upload />
            }
            <SignIn user={user} />
        </div>
    );
}