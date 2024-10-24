export function saveToLocalStorage(key: string, data: any) {
    if (isLocalStorageAvailable()) {
    localStorage.setItem(key, JSON.stringify(data));
    } else {
    console.log('Sorry, je browser ondersteunt web storage niet.');
    }
    }
    export function loadFromLocalStorage(key: string) {
    if (isLocalStorageAvailable()) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
    } else {
    console.log('Sorry, je browser ondersteunt web storage niet.');
    }
    }
    function isLocalStorageAvailable() {
    var test = 'test';
    try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
    } catch (e) {return false;
    }
    }