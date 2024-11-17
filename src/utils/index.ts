
export const uuid = () => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return timestamp + random;
}

export function capitalize(string) {
  if (!string) return '';
  return string
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isPromise(promise) {  
  return !!promise && typeof promise.then === 'function';
}

export function promisify(promise: any): Promise<any> {
  if (isPromise(promise)) return promise;
  return new Promise(resolve => resolve(promise));
}