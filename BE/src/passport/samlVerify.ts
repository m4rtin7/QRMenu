import passport from 'passport'
import config from 'config'
import { IPassportConfig } from '../types/interfaces';
import { Request, Response } from 'express';
import { Op, Transaction } from 'sequelize'
import sequelize from '../db/models';
import { createJwt } from '../utils/auth';
import { getUserById } from '../api/v1/users/get.user';
import dayjs from 'dayjs';
import { getRandomString } from '../utils/helper';
const passportConfig: IPassportConfig = config.get('passport');
const samlConfig = passportConfig.saml;

interface IUser {
    email: string
    displayName: string
    firstName: string
    surname: string
    passedFromSAML: boolean
}

export const passportUseSaml = (app: any) => {
    if (samlConfig.certificateBase64 == null || (samlConfig.certificateBase64 || '').toString().trim().length == 0) {
        return;
    }

    const bodyParser = require("body-parser");
    const allowHttpInlineScript = (process.env.SAML_ALLOW_HTTP_INLINE_SCRIPT == 'true' || process.env.SAML_ALLOW_HTTP_INLINE_SCRIPT == '1')
    const retTemplate = ""


    const SamlStrategy = require('passport-saml').Strategy;
    passport.use(new SamlStrategy(
        {
            path: samlConfig.callbackUrl,
            entryPoint: samlConfig.entryPoint,
            issuer: samlConfig.issuer,
            cert: samlConfig.certificateBase64
        },
        function (profile: any, done: (err: any, user: IUser) => void) {
            return done(null, {
                email: profile["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
                displayName: profile['http://schemas.microsoft.com/identity/claims/displayname'],
                firstName: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'],
                surname: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'],
                passedFromSAML: true
            });
        })
    );

    app.get(
        samlConfig.loginUrl,
        passport.authenticate("saml", { failureRedirect: "/", failureFlash: true })
    );

    app.post(
        samlConfig.callbackUrl,
        bodyParser.urlencoded({ extended: false }),
        passport.authenticate("saml", { failureRedirect: "/", failureFlash: true }),
        async (req: Request, res: Response) => {
            const { User } = req.models
            const appUser: IUser = req.user as any;

            if (appUser?.passedFromSAML != true) {
                return res.redirect("/");
            }

            let authUser = await User.findOne({
                where: {
                    [Op.and]: [
                        {
                            email: { [Op.eq]: appUser.email }
                        }
                    ]
                }
            });

            let transaction: Transaction
            try {
                transaction = await sequelize.transaction();

                if (!authUser) {
                    authUser = await User.create(
                        {
                            email: appUser.email,
                            name: appUser.firstName,
                            surname: appUser.surname,
                            confirmedAt: dayjs().toISOString(),
                            hash: getRandomString(32),
                            createdBy: 1
                        },
                        {
                            transaction,
                            applicationLogging: false
                        }
                    );
                }

                const [accessToken] = await Promise.all([
                    createJwt({ uid: authUser.id }, { audience: passportConfig.jwt.api.audience, expiresIn: passportConfig.jwt.api.exp }),
                    // set lastLogin timestamp
                    authUser.update(
                        {
                            lastLoginAt: new Date(),
                            lastTokenAt: new Date(),
                            updatedBy: authUser.id
                        },
                        {
                            transaction,
                            applicationLogging: false
                        }
                    )
                ])

                await transaction.commit();
                transaction = null;

                const userProfile = {
                    accessToken: accessToken,
                    profile: {
                        id: authUser.id,
                        fullname: authUser.fullName,
                    },
                    extendedProfile: await getUserById(req.models, authUser.id)
                }

                if (allowHttpInlineScript) {
                    res.set("Content-Security-Policy", "default-src 'self';base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self' 'unsafe-inline';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests");
                }

                res.set('Content-Type', 'text/html');
                return res.send(retTemplate.replace('{{SCRIPT_PLACEHOLDER}}', `if (window.AppState) {
                    AppState.setUser({
                        Token: '${userProfile.accessToken.split("'").join("\\'")}',
                        ExpiresAt: null,
                        Profile: ${JSON.stringify(userProfile.extendedProfile).split("'").join("\\'")}
                    }, true);

                    location.href='/';
                }`));

            } catch (error) {
                if (transaction) {
                    await transaction.rollback();
                }

                return res.redirect("/");
            }
        }
    );
}