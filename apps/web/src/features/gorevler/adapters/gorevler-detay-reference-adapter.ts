// @ts-nocheck
import {
  GDM_CHECKLIST,
  GDM_COMMENTS,
  GDM_DESCRIPTION,
  GDM_INFO,
  GDM_LINKED,
  GDM_PAGE,
  GDM_RELATED,
  GDM_REMINDER,
  GDM_SUMMARY,
  GDM_TAGS,
  GDM_TABS
} from "../data/gorevler-detay-mock";

export type GorevlerDetayReferenceSnapshot = {
  page: typeof GDM_PAGE;
  summary: typeof GDM_SUMMARY;
  tabs: typeof GDM_TABS;
  description: string;
  checklist: typeof GDM_CHECKLIST;
  comments: typeof GDM_COMMENTS;
  linked: typeof GDM_LINKED;
  related: typeof GDM_RELATED;
  info: typeof GDM_INFO;
  tags: typeof GDM_TAGS;
  reminder: string;
};

const build = (): GorevlerDetayReferenceSnapshot => ({
  page: GDM_PAGE,
  summary: GDM_SUMMARY,
  tabs: GDM_TABS,
  description: GDM_DESCRIPTION,
  checklist: GDM_CHECKLIST,
  comments: GDM_COMMENTS,
  linked: GDM_LINKED,
  related: GDM_RELATED,
  info: GDM_INFO,
  tags: GDM_TAGS,
  reminder: GDM_REMINDER
});

export const GOREVLER_DETAY_REFERENCE_INITIAL = build();
export const loadGorevlerDetayReferenceDemo = () => build();
export const loadGorevlerDetayReferenceLive = async () => build();
