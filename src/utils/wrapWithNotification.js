import { notification } from 'antd';

/**
 * Creates a wrapper for a function call which will show a notification on page
 * depending on the result of that function call.
 *
 * @callback WrapperFunction
 * @param {AsyncFunction} fn The function that will be wrapped.
 * @return {Function} The wapped funciton.
 *
 * @param {object} config The config object.
 * @param {string|Function} config.errorMessage The error message to show in case of error. If it is a function, the thrown `Error` object is passed as a parameter and it should return a `string`.
 * @param {string|Function} config.successMessage The success message to show in case of success. If it is a function, the value returned by the wrapped function is passed as a parameter and it should return a `string`.
 * @param {'topLeft'|'topRight'|'bottomLeft'|'bottomRight'} [config.placement=bottomRight] The placement of the notification on screen.
 * @param {number} [config.duration=5000] The duration of the notification in miliseconds.
 * @return {WrappedFunction} The wrapped function
 */

const wrapWithNotification = ({
  errorMessage,
  successMessage,
  placement = 'bottomRight',
  duration = 5000,
}) => async fn => {
  try {
    const result = await fn();
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
