import { createContext, createElement, useContext } from "react";
import { useAuth } from "./authContext";
import { owner_username } from "./globalvalues";

// Whose pages are these? The site owner's portfolios sit at the root (/full-stack,
// /resume/full-stack); every other account's under /u/<username>/. Pages read this to
// build their links, to ask the API for the right account (?u=), and to decide whether
// the person looking may edit: only the signed-in owner of THESE pages can.
const PageOwnerContext = createContext(owner_username);

export const PageOwnerProvider = ({ username, children }) =>
  createElement(PageOwnerContext.Provider, { value: username || owner_username }, children);

// The address of an account's front page, a portfolio, or its read-only resume.
export const accountHome = (username) => (username === owner_username ? "/" : `/u/${username}`);
export const portfolioPath = (username, slug) => (username === owner_username ? `/${slug}` : `/u/${username}/${slug}`);
export const resumePath = (username, slug) => (username === owner_username ? `/resume/${slug}` : `/u/${username}/resume/${slug}`);

export const usePageOwner = () => {
  const username = useContext(PageOwnerContext);
  const { isAuthenticated, username: me } = useAuth();
  const isSiteOwner = username === owner_username;
  return {
    username,
    isSiteOwner,
    canEdit: isAuthenticated && me === username,
    home: accountHome(username),
    path: (slug) => portfolioPath(username, slug),
    resumePath: (slug) => resumePath(username, slug),
    // added to resume API calls; the site owner's need nothing
    apiQuery: isSiteOwner ? "" : `u=${encodeURIComponent(username)}`,
  };
};
