import { useTranslation } from 'react-i18next';
import { Button } from './Button';

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    if (i18n.language === 'en') {
      i18n.changeLanguage('ru');
    } else if (i18n.language === 'ru') {
      i18n.changeLanguage('az');
    } else {
      i18n.changeLanguage('en');
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleLanguage} title="Change language">
      {i18n.language.toUpperCase()}
    </Button>
  );
}
