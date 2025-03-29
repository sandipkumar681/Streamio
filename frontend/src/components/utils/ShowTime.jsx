const ShowTime = ({ currentDuration, duration }) => {
  const secondsToHours = (duration) => {
    if (Math.floor(duration / 3600)) {
      return 0;
    }
    return Math.floor(duration / 3600);
  };

  const secondsToMinutes = (duration) => {
    return Math.floor(duration / 60);
  };

  const secondsToRemainderSeconds = (duration) => {
    return Math.floor(duration % 60);
  };

  return (
    <button disabled className="text-gray-400 mx-3 my-1 text-center">
      {secondsToHours(currentDuration) ? secondsToHours(currentDuration) : ""}
      {secondsToHours(currentDuration) ? ":" : ""}
      {secondsToMinutes(currentDuration)}
      {":"}
      {String(secondsToRemainderSeconds(currentDuration)).length === 1
        ? "0"
        : ""}
      {secondsToRemainderSeconds(currentDuration)} {" / "}
      {secondsToHours(duration) ? secondsToHours(duration) : ""}
      {secondsToHours(duration) ? ":" : ""}
      {secondsToMinutes(duration)}
      {":"}
      {String(secondsToRemainderSeconds(duration)).length === 1 ? "0" : ""}
      {secondsToRemainderSeconds(duration)}
    </button>
  );
};

export default ShowTime;
