import { apiInitializer } from "discourse/lib/api";

const PLUGIN_ID = "collapsed-sidebar-sections-by-default";

const splitSettings = (sections) => {
  return sections
    .split("|")
    .map((section) => section.trim())
    .filter((section) => section.length > 0);
};

export default apiInitializer("0.11.1", (api) => {
  const currentUser = api.getCurrentUser();

  if (
    (settings.allow_sidebar_collapsing_to === "Anonymous" && currentUser) ||
    (settings.allow_sidebar_collapsing_to === "New Users" &&
      (!currentUser || currentUser.trust_level > 0))
  ) {
    return;
  }

  if (settings.allow_sidebar_collapsing_to === "New Users" && !currentUser) {
    return;
  }

  const ignoreSectionsNames = splitSettings(
    currentUser
      ? settings.ignore_sidebar_sections_user
      : settings.ignore_sidebar_sections_anonymous
  );

  api.modifyClass("component:sidebar/section", {
    pluginId: PLUGIN_ID,

    get displaySection() {
      const displaySection =
        this.args.displaySection === undefined || this.args.displaySection;

      if (
        displaySection &&
        this.args.collapsable &&
        (ignoreSectionsNames.length <= 0 ||
          !ignoreSectionsNames.includes(this.args.sectionName))
      ) {
        const customKey = this.collapsedSidebarSectionKey + "-default";

        // First time we've seen this section
        if (this.keyValueStore.getItem(customKey) === undefined) {
          // Collapse the section by default
          this.displaySectionContent = false;
          this.keyValueStore.setItem(this.collapsedSidebarSectionKey, true);

          // Remember that we've seen this section
          this.keyValueStore.setItem(customKey, true);
        }
      }

      return displaySection;
    },
  });
});
