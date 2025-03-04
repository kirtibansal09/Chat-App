function extractLinks(inputString) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
//   const urlRegex = /(https?:\/\/[^\s.,!?")]+)/g;

  // Array to hold the found links
  const linksArray = [];

  // Replacing the URLs with the desired HTML structure
  const modifiedString = inputString.replace(urlRegex, (url) => {
    const urlObject = new URL(url);
    const domain = urlObject.hostname;
    linksArray.push(url);
    return `<span class="text-primary underline"><a href="${url}" target="_blank">${domain}</a></span>`;
  });

  return {
    originalString: modifiedString,
    links: linksArray,
  };
}

export default extractLinks;
