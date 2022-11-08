import { WebUntisSecretAuth } from './secret';
import type { Authenticator } from './secret';
import type { URL } from 'url';

/**
 * @private
 */
export type URLClass = typeof URL;

export class WebUntisQR extends WebUntisSecretAuth {
    /**
     * Use the data you get from a WebUntis QR code
     * @constructor
     * @param {string} QRCodeURI A WebUntis uri. This is the data you get from the QR Code from the webuntis webapp under profile->Data access->Display
     * @param {string} [identity="Awesome"]  A identity like: MyAwesomeApp
     * @param {Object} authenticator Custom otplib v12 instance. Default will use the default otplib configuration.
     * @param {Object} URL Custom whatwg url implementation. Default will use the nodejs implementation.
     * @param {boolean} [disableUserAgent=false] If this is true, axios will not send a custom User-Agent
     */
    constructor(
        QRCodeURI: string,
        identity: string,
        authenticator: Authenticator,
        URL?: URLClass,
        disableUserAgent = false
    ) {
        let URLImplementation = URL;
        if (!URL) {
            if ('import' in globalThis) {
                throw new Error(
                    'You need to provide the URL object by yourself. We can not eval the require in ESM mode.'
                );
            }
            // React-Native will not eval this expression
            URLImplementation = eval("require('url').URL") as URLClass;
        }
        const uri = new URLImplementation!(QRCodeURI);
        super(
            uri.searchParams.get('school')!,
            uri.searchParams.get('user')!,
            uri.searchParams.get('key')!,
            uri.searchParams.get('url')!,
            identity,
            authenticator,
            disableUserAgent
        );
    }
}
