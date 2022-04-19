// HTTP client
const axios = require("axios").default;

// Readability, dom and dom purify
const { JSDOM } = require("jsdom");
let { Readability } = require("@mozilla/readability");
const createDOMPurify = require("dompurify");
const DOMPurify = createDOMPurify(new JSDOM("").window);

// Not too happy to allow iframe, but it's the only way to get youtube videos
const domPurifyOptions = {
  ADD_TAGS: ["iframe", "video"],
};

exports.handler = async function (event) {
  console.log("Initiated Article Grabber")
  console.log("event: ",event);
  console.log("eventbody: ",event.body);
  console.log("eventbody: ",event.body.url);
  //const url = event.multiValueHeaders.url[0];
  const url = event.body.url
  console.log(`url: ${url}`);
  let content = null;
  let excerpt = null;
  let message = null;
  let info = null;

  await axios
    .get(url)
    .then((response) => {
      const dom = new JSDOM(response.data, {
        url: url,
      });
      console.log(`dom: ${dom}`);

      let parsed = new Readability(dom.window.document).parse();
      console.log(`parsed: ${parsed}`);
      content = DOMPurify.sanitize(parsed.content, domPurifyOptions);
      excerpt = parsed.excerpt || "";
      console.log(`content: ${content}`);
      console.log(`excerpt: ${excerpt}`);

      console.log("Fetched and parsed " + url + " successfully");
      message = "Successfully fetched and parsed " + url + " ";
      info = 'success'
    })
    .catch((error) => {
      console.log(error);
      message = error;
      info = "error";
      console.log("Fuck! Error while fetching the content");
    });
    

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html" },
    body: JSON.stringify({
      info: info,
      message: message,
      url: url,
      content: content,
      title: excerpt,
    }),
  };
};
