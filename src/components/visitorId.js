// The anonymous visitor id and the "this is the owner's browser" flag, shared by
// the page-view counter and the read-only resume page.

export const VISITOR_KEY = "vm_visitor_id";
export const OWNER_KEY = "vm_owner_browser";

// Storage can be blocked (private mode, strict settings) - then we simply don't count.
export const attempt = (fn) => {
  try {
    return fn();
  } catch {
    return null;
  }
};

export const getVisitorId = () =>
  attempt(() => {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  });

export const isOwnerBrowser = () => attempt(() => localStorage.getItem(OWNER_KEY)) === "1";
export const markOwnerBrowser = () => attempt(() => localStorage.setItem(OWNER_KEY, "1"));
