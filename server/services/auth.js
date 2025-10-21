const sesionIdToUserMap = new Map();

export function setUser(id, user) {
    if (user === null) {
        // If user is null, delete the entry
        sesionIdToUserMap.delete(id);
    } else {
        // Otherwise, set or update the user
        sesionIdToUserMap.set(id, user);
    }
}

export function getUser(id) {
    return sesionIdToUserMap.get(id);
}