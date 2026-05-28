// @ts-nocheck
import { WFT_CONTEXT, WFT_EVENTS, WFT_PAGE } from "../data/workflow-timeline-mock";

export type WorkflowReferenceSnapshot = {
  page: typeof WFT_PAGE;
  events: typeof WFT_EVENTS;
  context: typeof WFT_CONTEXT;
};

const build = (): WorkflowReferenceSnapshot => ({
  page: WFT_PAGE,
  events: WFT_EVENTS,
  context: WFT_CONTEXT
});

export const WORKFLOW_REFERENCE_INITIAL = build();
export const loadWorkflowReferenceDemo = () => build();
export const loadWorkflowReferenceLive = async () => build();
