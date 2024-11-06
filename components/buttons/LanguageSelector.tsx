"use client";
import { Select } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import "flag-icons/css/flag-icons.min.css";
import styles from './languageSelector.module.css';

const LanguageSelector = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [defaultLanguage, setDefaultLanguage] = useState('en');

  useEffect(() => {
    const languageCode = pathname.split('/')[1];
    if (['it', 'de', 'en'].includes(languageCode)) {
      setDefaultLanguage(languageCode);
    } else {
      setDefaultLanguage('en');
    }
  }, [pathname]);

  const handleChange = useCallback((value: string) => {
    const newPathname = pathname.replace(`/${pathname.split('/')[1]}`, `/${value}`);
    router.push(newPathname);
  }, [router, pathname]);

  return (
    <Select 
      value={defaultLanguage} 
      onChange={handleChange} 
      className={styles.languageSelector}
    >
      <Select.Option value="it" className={styles.languageOption}>
        <span className="fi fi-it"></span> Italiano
      </Select.Option>
      <Select.Option value="de" className={styles.languageOption}>
        <span className="fi fi-de"></span> Deutsch
      </Select.Option>
      <Select.Option value="en" className={styles.languageOption}>
        <span className="fi fi-gb"></span> English
      </Select.Option>
    </Select>
  );
};

export default LanguageSelector;
