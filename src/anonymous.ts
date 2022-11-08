import { InternalWebuntisSecretLogin } from './base';

export class WebUntisAnonymousAuth extends InternalWebuntisSecretLogin {
    /**
     *
     * @param {string} school
     * @param {string} baseurl
     * @param {string} [identity='Awesome']
     * @param {boolean} [disableUserAgent=false] If this is true, axios will not send a custom User-Agent
     */
    constructor(school: string, baseurl: string, identity = 'Awesome', disableUserAgent = false) {
        // TODO: Make this a bit more beautiful and more type safe
        super(school, null as unknown as string, null as unknown as string, baseurl, identity, disableUserAgent);
        this.username = '#anonymous#';
        this.anonymous = true;
    }

    override async login() {
        // Check whether the school has public access or not
        const url = `/WebUntis/jsonrpc_intern.do`;

        const response = await this.axios({
            method: 'POST',
            url,
            params: {
                m: 'getAppSharedSecret',
                school: this.school,
                v: 'i3.5',
            },
            data: {
                id: this.id,
                method: 'getAppSharedSecret',
                params: [
                    {
                        userName: '#anonymous#',
                        password: '',
                    },
                ],
                jsonrpc: '2.0',
            },
        });

        if (response.data && response.data.error)
            throw new Error('Failed to login. ' + (response.data.error.message || ''));

        // OTP never changes when using anonymous login
        const otp = 100170;
        const time = new Date().getTime();
        return await this._otpLogin(otp, this.username, time, true);
    }
}
