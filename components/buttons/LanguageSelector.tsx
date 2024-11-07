"use client";
import { Select } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import "flag-icons/css/flag-icons.min.css";
import styles from './languageSelector.module.css';
import { CaretDownOutlined } from '@ant-design/icons';

const LanguageSelector = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
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
      suffixIcon={isMobile ? null : <CaretDownOutlined />}
    >
      <Select.Option value="it" className={styles.languageOption} >
        <span className="fi fi-it"></span> {!isMobile ? "Italiano" : ""}
      </Select.Option>
      <Select.Option value="de" className={styles.languageOption}>
        <span className="fi fi-de"></span> {!isMobile ? "Deutsch" : ""}
      </Select.Option>
      <Select.Option value="en" className={styles.languageOption}>
        <span className="fi fi-gb"></span> {!isMobile ? "English" : ""}
      </Select.Option>
    </Select>
  );
};

export default LanguageSelector;
