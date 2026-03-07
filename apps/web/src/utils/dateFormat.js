function extractTimeFromISO(isoString) {
  console.log(isoString);

  const date = new Date(isoString);

  let hours = date.getHours();
  let minutes = String(date.getMinutes()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12

  const formattedHours = String(hours).padStart(2, "0");

  return `${formattedHours}:${minutes} ${ampm}`;
}

export default extractTimeFromISO;
