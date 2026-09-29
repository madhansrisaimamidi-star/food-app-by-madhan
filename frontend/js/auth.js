/**
 * FoodieExpress Authentication Controller
 * Connects login and register flows directly to foodieApi (REST API + Local Token Auth)
 */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#authForm");
  const error = document.querySelector("#formError");

  // Toggle password visibility
  document.querySelectorAll("[data-toggle-password]").forEach(button => {
    button.addEventListener("click", () => {
      const input = document.querySelector(`#${button.dataset.togglePassword}`);
      input.type = input.type === "password" ? "text" : "password";
      button.textContent = input.type === "password" ? "Show" : "Hide";
    });
  });

  // Demo user filling pills
  document.querySelectorAll("[data-fill-email]").forEach(pill => {
    pill.addEventListener("click", () => {
      const emailInput = document.querySelector("#email");
      const passInput = document.querySelector("#password");
      if (emailInput) emailInput.value = pill.dataset.fillEmail;
      if (passInput) passInput.value = pill.dataset.fillPass || "password123";
    });
  });

  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (error) error.textContent = "";

    const submitBtn = form.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Authorizing…";
    submitBtn.disabled = true;

    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value;

    if (password.length < 6) {
      if (error) error.textContent = "Password must contain at least 6 characters.";
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      return;
    }

    const isRegister = form.dataset.mode === "register";

    if (isRegister) {
      const name = document.querySelector("#name").value.trim();
      const confirmPassword = document.querySelector("#confirmPassword").value;
      if (password !== confirmPassword) {
        if (error) error.textContent = "Passwords do not match.";
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }

      const res = await foodieApi.register(name, email, password);
      if (res.success) {
        window.location.href = "index.html";
      } else {
        if (error) error.textContent = res.message || "Registration failed.";
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    } else {
      const res = await foodieApi.login(email, password);
      if (res.success) {
        window.location.href = "index.html";
      } else {
        if (error) error.textContent = res.message || "Invalid email or password.";
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    }
  });
});
