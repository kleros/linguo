import { notification } from 'antd';

/**
 * Creates a wrapper for a function call which will show a notification on page
 * depending on the result of that function call.
 *
 * @function
 *
 *
 * @param {object} config The config object.
 * @param {string|Function} config.errorMessage The error message to show in case of error. If it is a function, the thrown `Error` object is passed as a parameter and it should return a `string`.
 * @param {string|Function} config.successMessage The success message to show in case of success. If it is a function, the value returned by the wrapped function is passed as a parameter and it should return a `string`.
 * @param {'topLeft'|'topRight'|'bottomLeft'|'bottomRight'} [config.placement='bottomRight'] The placement of the notification on screen.
 * @param {number} [config.duration=5000] The duration of the notification in miliseconds.
 * @return {(fn: Function) => (...args: any[]) => Promise<any> } The wrapped function
 */
const wrapWithNotification = ({
  errorMessage,
  successMessage,
  placement = 'bottomRight',
  duration = 5,
}) => fn => async (...args) => {
  try {
    const result = await fn(...args);
    const message = typeof successMessage === 'function' ? successMessage(result) : successMessage;
    notification.success({
      placement,
      message,
      duration,
    });
    return result;
  } catch (err) {
    const message = typeof errorMessage === 'function' ? errorMessage(err) : errorMessage;
    notification.error({
      placement,
      message,
      duration,
    });
  }
};

export { wrapWithNotification as default };
