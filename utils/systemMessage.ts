import 'server-only'
 
const dictionaries : any = {
  it: () => import('../messages/it.json').then((module) => module.default),
  en: () => import('../messages/en.json').then((module) => module.default),
  de: () => import('../messages/de.json').then((module) => module.default)
}
 
export const getMessages = async (locale:string) => dictionaries[locale]()