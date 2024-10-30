import 'server-only';
import it from '@/messages/it.json';
import de from '@/messages/de.json';
import en from '@/messages/en.json';

type Messages = { [key: string]: string };

export function getMessages(locale: string): Messages {
  switch (locale) {
    case "en":
      return en;
    case "de":
      return de;
    case "xx":
      // Return an object with each key mapping to itself
      return Object.keys(it).reduce((acc, key) => {
        acc[key] = "<"+key+">";
        return acc;
      }, {} as Messages);
    default:
      return it;
  }
}
