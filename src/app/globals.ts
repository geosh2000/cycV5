// Production = 1
// Development = 0
let env = 0


export const APISERV = env == 1 ? 'https://operaciones.pricetravel.com.mx' : 'http://testoperaciones.pricetravel.com.mx';
export const APIFOLDER = env == 1 ? 'restful' : 'restfulbck';
export const CYCTITLE = 'ComeyCome';
export const CYCYEAR = '2019';
export const VER = 'v2.4.3';
