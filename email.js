// ============================================================
//  email.js  -  Robust EmailJS Integration for Portfolio
//  Author: Satyajit Rout
//
//  Template Parameter Mapping:
//    {{name}}      - Visitor's full name
//    {{email}}     - Visitor's email address (used for Auto-Reply To & Reply-To)
//    {{message}}   - Visitor's message content
//    {{reply_to}}  - Visitor's email (for email client direct reply)
//    {{to_name}}   - Portfolio owner's name ("Satyajit")
//    {{to_email}}  - Portfolio owner's email ("satyajitrout011@gmail.com")
// ============================================================

// ---- EmailJS Configuration ----
// Note: EmailJS Public Key is meant for client-side authentication.
// Private keys / account secrets are NEVER exposed here.
var EMAILJS_SERVICE_ID = "service_ptttjt7";
var EMAILJS_TEMPLATE_ID = "template_tycl3xj";
var EMAILJS_PUBLIC_KEY = "cN9aI4VcR8iQQxxHI";
var PORTFOLIO_OWNER_EMAIL = "satyajitrout011@gmail.com";

// ---- Initialize EmailJS SDK ----
(function initEmailJS() {
  if (typeof emailjs === "undefined") {
    console.error("[email.js] EmailJS SDK script not found. Ensure the CDN is included before email.js.");
    return;
  }
  emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY
  });
  console.log("[email.js] EmailJS successfully initialized.");
})();

// ---- Contact Form Handler ----
(function setupContactForm() {
  var form = document.getElementById("cf");
  var statusEl = document.getElementById("st");

  if (!form || !statusEl) {
    console.warn("[email.js] Contact form (#cf) or status element (#st) not found.");
    return;
  }

  var submitBtn = form.querySelector("button[type='submit']");
  var defaultBtnText = submitBtn ? submitBtn.textContent : "Send Message";

  // Elements
  var nameInput = document.getElementById("n");
  var emailInput = document.getElementById("e");
  var messageInput = document.getElementById("m");

  var errName = document.getElementById("en");
  var errEmail = document.getElementById("ee");
  var errMessage = document.getElementById("em");

  function setStatus(text, color) {
    statusEl.textContent = text;
    statusEl.style.color = color || "";
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Sending…" : defaultBtnText;
    submitBtn.style.cursor = isLoading ? "not-allowed" : "pointer";
    submitBtn.style.opacity = isLoading ? "0.7" : "1";
  }

  function clearErrors() {
    if (errName) errName.textContent = "";
    if (errEmail) errEmail.textContent = "";
    if (errMessage) errMessage.textContent = "";
  }

  // Real-time error clearing when user types
  if (nameInput && errName) {
    nameInput.addEventListener("input", function () {
      if (nameInput.value.trim().length >= 2) errName.textContent = "";
    });
  }
  if (emailInput && errEmail) {
    emailInput.addEventListener("input", function () {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailInput.value.trim())) errEmail.textContent = "";
    });
  }
  if (messageInput && errMessage) {
    messageInput.addEventListener("input", function () {
      if (messageInput.value.trim().length >= 10) errMessage.textContent = "";
    });
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    setStatus("", "");
    clearErrors();

    var nameVal = nameInput ? nameInput.value.trim() : "";
    var emailVal = emailInput ? emailInput.value.trim() : "";
    var messageVal = messageInput ? messageInput.value.trim() : "";
    var isValid = true;

    // ---- Validation ----
    // 1. Name validation
    if (!nameVal || nameVal.length < 2) {
      if (errName) errName.textContent = "Please enter your name (at least 2 characters).";
      isValid = false;
    }

    // 2. Email validation (RFC compliant check)
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailVal) {
      if (errEmail) errEmail.textContent = "Please enter your email address.";
      isValid = false;
    } else if (!emailRegex.test(emailVal)) {
      if (errEmail) errEmail.textContent = "Please enter a valid email address (e.g. name@domain.com).";
      isValid = false;
    }

    // 3. Message validation
    if (!messageVal || messageVal.length < 10) {
      if (errMessage) errMessage.textContent = "Message should be at least 10 characters long.";
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    // ---- Fallback if EmailJS SDK is blocked or offline ----
    if (typeof emailjs === "undefined") {
      console.warn("[email.js] EmailJS is not defined. Falling back to mailto client.");
      location.href = "mailto:" + PORTFOLIO_OWNER_EMAIL +
        "?subject=" + encodeURIComponent("Portfolio enquiry from " + nameVal) +
        "&body=" + encodeURIComponent(messageVal + "\n\n— " + nameVal + " (" + emailVal + ")");
      setStatus("Opening your email client as fallback…", "");
      return;
    }

    // ---- Enter Loading State ----
    setLoading(true);
    setStatus("Sending your message…", "var(--mu, #a1a1aa)");

    // ---- EmailJS Template Parameters Mapping ----
    // CRITICAL:
    // - `email` is passed with the visitor's email, resolving the 422 "The recipients address is empty" error
    //   when the Auto-Reply template's To Email is set to `{{email}}`.
    // - `name` and `message` provide the visitor details.
    // - `reply_to` ensures replying to the notification email goes directly to the visitor.
    // - `to_email` & `to_name` provide recipient metadata for notifications.
    var templateParams = {
      name: nameVal,
      email: emailVal,
      message: messageVal,
      reply_to: emailVal,

      // Aliases ensuring full compatibility with various EmailJS template configurations
      from_name: nameVal,
      from_email: emailVal,
      user_name: nameVal,
      user_email: emailVal,
      to_name: "Satyajit",
      to_email: PORTFOLIO_OWNER_EMAIL
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(function (response) {
        console.log("[email.js] Email successfully sent!", response.status, response.text);
        setLoading(false);
        setStatus("✅ Message sent successfully! I’ll get back to you soon.", "#86efac");
        form.reset();
        clearErrors();
      })
      .catch(function (error) {
        // Detailed error logging for debugging
        console.error("[email.js] EmailJS submission failed:", error);
        var errorDetail = "";
        if (error) {
          if (typeof error.text === "string" && error.text.length > 0) {
            errorDetail = " (" + error.text + ")";
          } else if (typeof error.message === "string") {
            errorDetail = " (" + error.message + ")";
          }
        }
        setLoading(false);
        setStatus(
          "❌ Could not send message" + errorDetail + ". Please reach out directly to " + PORTFOLIO_OWNER_EMAIL + ".",
          "#f87171"
        );
      });
  });
})();
