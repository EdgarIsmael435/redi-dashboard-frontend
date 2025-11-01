const listeners = [];

export const onSessionExpired = (callback) => {
  listeners.push(callback);
};

export const triggerSessionExpired = () => {
  listeners.forEach((cb) => cb());
};
