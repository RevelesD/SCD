"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios = require('axios');
let request = require('request');
const https = require('http');
const jwt = require('jsonwebtoken');
const loginQueries = {
    login: async (_, args, context, info) => {
        //try {
        const data = JSON.stringify({
            expediente: '258846',
            password: '258846.'
        });
        const options = {
            hostname: 'https://portalinformatica.uaq.mx',
            path: '/portalInformatica/portal-informatica-api-iniciar-sesion',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };
        const req = https.request(options, (res) => {
            console.log(`STATUS: ${res.statusCode}`);
            console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                console.log(`BODY: ${chunk}`);
            });
            res.on('end', () => {
                console.log('No more data in response.');
            });
        });
        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
        });
        req.end();
    } //login end
    /*const user = await User
      .findOne({name: args.name, clave: args.clave}
      ).exec();
    //const user = await User.findOne({_id: args.id});
    if(!user){
        //Creation of user in DB
        //set default permissions of "docente" for every user just created
        const permission = await Permission.findOne({ rank: config.permission.docente});

        //User Creation
        const user = await User.create({
          clave: args.input.clave,
          status: args.input.status,
          name: args.input.name,
          adscription: args.input.adscription,
          permissions: [permission]
        });

        //Find the user just created and connect their adscription filed
        // with the objectID from Campus(adscription).
        const res = await User
          .findOne({_id: user._id})
          .populate({path: 'adscription'}).exec();

        //Token creation, We add the userId to token's data
        // in order to used as the authentication
        const token =  jwt.sign(
          { userId: user._id, clave: user.clave },
          'key',
          {expiresIn: '1h', algorithm: 'HS256'});
        return {
          userId: user._id,
          token: token,
          tokenExpiration: 1
        }
    }
    if (args.clave != user.clave){
      throw new Error("Datos Incorrectosasdas!");
    }
    //The input Data is correct
    //Token creation, We add the userId to token's data
    // in order to used as authentication
    const token =  jwt.sign(
      { userId: user._id, clave: user.clave },
      'key',
      {expiresIn: '1h', algorithm: 'HS256'});
    return {
      userId: user._id,
      token: token,
      tokenExpiration: 1
    }*/
    // } catch (e) {
    //   throw new ApolloError(e);
    // }
};
exports.loginQueries = loginQueries;
//# sourceMappingURL=authLogin.resolver.js.map