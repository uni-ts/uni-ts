import { flow } from '@uni-ts/composition';

const suffix = (suffix: string) => (str: string) => str + suffix;
const upperFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const fallback = (fallback: string) => (str: string) => str.trim() || fallback;

export const getUserDisplayName = flow(fallback('Anonymous'), upperFirst);
export const getAdminDisplayName = flow(upperFirst, suffix(' (Admin)'));
export const getNewBlogpostTitle = flow(fallback('Untitled'), suffix(' (New)'));
