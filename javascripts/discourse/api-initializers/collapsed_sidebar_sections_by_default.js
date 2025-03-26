import { apiInitializer } from "discourse/lib/api";

export default apiInitializer((api) => {
  const currentUser = api.getCurrentUser();

  if (settings.allow_sidebar_collapsing_to !== "everyone") {
    const allowedGroups = settings.allow_sidebar_collapsing_to
      .split("|")
      .map(Number);

    const userGroups = currentUser?.groups?.map((group) => group.id) || [];
    if (![...allowedGroups].some((group) => userGroups.includes(group))) {
      return;
    }
  }

  const ignoreSectionsNames = (
    currentUser
      ? settings.ignore_sidebar_sections_user
      : settings.ignore_sidebar_sections_anonymous
  ).split("|");

  api.modifyClass(
    "component:sidebar/section",
    (Superclass) =>
      class extends Superclass {
        get isCollapsed() {
          if (!this.args.collapsable) {
            return false;
          }

          if (
            this.keyValueStore.getItem(this.collapsedSidebarSectionKey) ===
            undefined
          ) {
            if (
              ignoreSectionsNames.length &&
              !ignoreSectionsNames.includes(this.args.sectionName)
            ) {
              return true;
            }

            return this.args.collapsedByDefault;
          }

          return (
            this.keyValueStore.getItem(this.collapsedSidebarSectionKey) ===
            "true"
          );
        }
      }
  );
});
