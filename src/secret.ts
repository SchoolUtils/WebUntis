import { InternalWebuntisSecretLogin } from './base';
import type { authenticator } from 'otplib';

export type Authenticator = typeof authenticator;

export class WebUntisSecretAuth extends InternalWebuntisSecretLogin {
    private readonly secret: string;
    private authenticator: Authenticator;

    /**
     *
     * @constructor
     * @augments WebUntis
     * @param {string} school The school identifier
     * @param {string} user
     * @param {string} secret
     * @param {string} baseurl Just the host name of your WebUntis (Example: mese.webuntis.com)
     * @param {string} [identity="Awesome"] A identity like: MyAwesomeApp
     * @param {Object} authenticator Custom otplib v12 instance. Default will use the default otplib configuration.
     * @param {boolean} [disableUserAgent=false] If this is true, axios will not send a custom User-Agent
     */
    constructor(
        school: string,
        user: string,
        secret: string,
        baseurl: string,
        identity = 'Awesome',
        authenticator: Authenticator,
        disableUserAgent = false,
    ) {
        super(school, user, null as unknown as string, baseurl, identity, disableUserAgent);
        this.secret = secret;
        this.authenticator = authenticator;
        if (!authenticator) {
            if ('import' in globalThis) {
                throw new Error(
                    'You need to provide the otplib object by yourself. We can not eval the require in ESM mode.',
                );
            }
            // React-Native will not eval this expression
            const { authenticator } = eval("require('otplib')");
            this.authenticator = authenticator;
        }
    }

    // @ts-ignore
    async login() {
        // Get JSESSION
        const token = this.authenticator.generate(this.secret);
        const time = new Date().getTime();
        return await this._otpLogin(token, this.username, time);
    }
}
