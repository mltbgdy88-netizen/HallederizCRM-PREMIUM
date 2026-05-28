// @ts-nocheck
import {
  KRM_FILTERS,
  KRM_FOOTER_NOTE,
  KRM_LEGEND,
  KRM_MODULES,
  KRM_ROLES,
  KRM_SUBTITLE,
  KRM_TITLE
} from "../data/kullanicilar-roller-matris-mock";

export type KullanicilarRollerReferenceSnapshot = {
  title: string;
  subtitle: string;
  modules: typeof KRM_MODULES;
  roles: typeof KRM_ROLES;
  legend: typeof KRM_LEGEND;
  filters: typeof KRM_FILTERS;
  footerNote: string;
};

const build = (): KullanicilarRollerReferenceSnapshot => ({
  title: KRM_TITLE,
  subtitle: KRM_SUBTITLE,
  modules: KRM_MODULES,
  roles: KRM_ROLES,
  legend: KRM_LEGEND,
  filters: KRM_FILTERS,
  footerNote: KRM_FOOTER_NOTE
});

export const KULLANICILAR_ROLLER_REFERENCE_INITIAL = build();
export const loadKullanicilarRollerReferenceDemo = () => build();
export const loadKullanicilarRollerReferenceLive = async () => build();
