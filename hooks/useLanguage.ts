import { useState } from 'react';
import { langDict } from '../utils/translations';

export type Language = 'zh' | 'en';

export function useLanguage() {
    const [lang, setLang] = useState<Language>('zh');

    const toggleLanguage = () => {
        setLang((prev) => (prev === 'zh' ? 'en' : 'zh'));
    };

    return {
        lang,
        t: langDict[lang],
        setLang,
        toggleLanguage,
    };
}
