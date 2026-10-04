export function flowerGuideSessionState(isMember: boolean) {
  return isMember
    ? { showLogin: false, showMemberControls: true }
    : { showLogin: true, showMemberControls: false };
}
