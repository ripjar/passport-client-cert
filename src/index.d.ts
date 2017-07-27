import {Request} from 'express';

import passport = require('passport');
import {Certificate} from 'tls';


export interface PeerCertificate {
  subject: Certificate;
  issuerInfo: Certificate;
  issuer: Certificate;
  raw: any;
  valid_from: string;
  valid_to: string;
  fingerprint: string;
  serialNumber: string;
}

export interface StrategyOptions {
  passReqToCallback?: boolean;
  allowUnauthorized?: boolean
}

export interface StrategyOptionsWithRequest {
  passReqToCallback: boolean;
}

export interface VerifyOptions {
  message: string;
}

export interface VerifyCallback {
  (error: any, user?: any, options?: VerifyOptions): void;
}

export interface VerifyFunctionWithRequest {
  (clientCert: PeerCertificate, req: Request, done: VerifyCallback): void;
}

export interface VerifyFunction {
  (clientCert: PeerCertificate, done: VerifyCallback): void;
}

declare class Strategy implements Strategy {
  constructor(options: StrategyOptionsWithRequest, verify: VerifyFunctionWithRequest);
  constructor(options: StrategyOptions, verify: VerifyFunction);
  constructor(verify: VerifyFunction);

  name: string;
  authenticate: (req: Request, options?: Object) => void;
}