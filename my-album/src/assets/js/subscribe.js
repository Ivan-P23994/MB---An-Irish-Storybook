// ========== HubSpot Custom Subscribe Form ==========

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("hubspotCustomForm");
  if (!form) return; // Skip if this page doesn’t have the form

  const messageBox = document.getElementById("formMessage");
  const endpoint =
    "https://api.hsforms.com/submissions/v3/integration/submit/147115643/74ac6d15-1778-4c05-bb55-6f3929ab1137";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    if (!email) return;

    const data = {
      fields: [{ name: "email", value: email }],
      context: {
        pageUri: window.location.href,
        pageName: document.title,
      },
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showMessage("Thank you for joining! Check your inbox soon 🎶", "#c6a87d");
        form.reset();
      } else {
        showMessage("Something went wrong. Please try again later.", "#ff8a8a");
      }
    } catch (error) {
      console.error("HubSpot form error:", error);
      showMessage("Network error. Please try again.", "#ff8a8a");
    }
  });

  function showMessage(text, color) {
    messageBox.textContent = text;
    messageBox.style.color = color;
    messageBox.hidden = false;
  }
});
