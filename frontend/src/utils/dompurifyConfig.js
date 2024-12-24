import DOMPurify from "dompurify";

// Configure DOMPurify for global use
DOMPurify.setConfig({
    // Disallow the 'style' attribute globally
  FORBID_ATTR: ["style", "onload", "onerror"], 
  // Disallow SVG and MathML tags
  FORBID_TAGS: ["script", "svg", "math"], 
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: []
});


export default DOMPurify;
