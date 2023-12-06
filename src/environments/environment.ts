const domainUrl = "https://snakeeyes.no-ip.org/";

export const environment = {
    production      : false,
    environmentName : "default",
    domainUrl       : domainUrl,
    webUrl          : domainUrl + 'eqmscustomer/#/',
    apiUrl          : domainUrl + 'eqmsjsonwebservice/services',
    appVersion      : `v${require('../../package.json').version}`
};