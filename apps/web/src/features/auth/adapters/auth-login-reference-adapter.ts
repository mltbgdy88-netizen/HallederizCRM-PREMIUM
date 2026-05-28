// @ts-nocheck
import { LOGIN_BRAND, LOGIN_FEATURES, LOGIN_FORM } from "../data/login-split-mock";

export type AuthLoginReferenceSnapshot = {
  brand: typeof LOGIN_BRAND;
  features: typeof LOGIN_FEATURES;
  form: typeof LOGIN_FORM;
};

const build = (): AuthLoginReferenceSnapshot => ({
  brand: LOGIN_BRAND,
  features: LOGIN_FEATURES,
  form: LOGIN_FORM
});

export const AUTH_LOGIN_REFERENCE_INITIAL = build();
export const loadAuthLoginReferenceDemo = () => build();
export const loadAuthLoginReferenceLive = async () => build();
