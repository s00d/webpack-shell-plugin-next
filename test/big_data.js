console.log('run bigData');
setTimeout(function () {
  try {
    return Number.MAX_SAFE_INTEGER + Number.MAX_SAFE_INTEGER
  } catch (e) {
    console.warn(e)
  }
}, 1000);

