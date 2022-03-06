export async function persisted(): Promise<boolean> {
  // Check if site's storage has been marked as persistent
  if (navigator.storage) {
    const isPersisted = await navigator.storage.persisted();
    console.log(`persisted: ${isPersisted}`);
    return isPersisted;
  }
  return false;
}

export async function persist(): Promise<boolean> {
  // Request persistent storage for site
  if (navigator.storage) {
    const isPersisted = await navigator.storage.persist();
    console.log(`persist: ${isPersisted}`);
    return isPersisted;
  }
  return false;
}
