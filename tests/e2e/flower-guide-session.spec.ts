import { expect, test } from "@playwright/test";

import { flowerGuideSessionState } from "../../features/flowers/flower-guide-session";

test("shows visitor controls without a member session", () => {
  expect(flowerGuideSessionState(false)).toEqual({
    showLogin: true,
    showMemberControls: false,
  });
});

test("shows private-area controls for a verified member", () => {
  expect(flowerGuideSessionState(true)).toEqual({
    showLogin: false,
    showMemberControls: true,
  });
});
