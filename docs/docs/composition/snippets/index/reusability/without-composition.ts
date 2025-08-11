function getUserDisplayName(name: string) {
  const result = name.trim() || 'Anonymous';
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function getAdminDisplayName(name: string) {
  const result = name.charAt(0).toUpperCase() + name.slice(1);
  return `${result} (Admin)`;
}

function getNewBlogpostTitle(title: string) {
  const result = title.trim() || 'Untitled';
  return `${result} (New)`;
}
