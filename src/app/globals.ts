// Production = 1
// Development = 0
let env = 0


export const APISERV = env == 1 ? 'https://operaciones.pricetravel.com.mx' : 'http://testoperaciones.pricetravel.com.mx';
export const APIFOLDER = env == 1 ? 'restful' : 'restfulbck';
