// ==============================================================
// DEVFORMAT PRO - CORE CLIENT-SIDE ENGINE (100% PRIVATE)
// Zero server dependencies • Sub-millisecond local execution
// ==============================================================

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initJsonStats();
  initRegexListeners();
  initJwtListeners();
});

// -------------------- 1. TAB SWITCHING --------------------
function initTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  const toolSections = document.querySelectorAll(".tool-card");

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      toolSections.forEach(s => s.style.display = "none");

      btn.classList.add("active");
      const targetTool = btn.getAttribute("data-tool");
      const targetCard = document.getElementById(`tool-${targetTool}`);
      if (targetCard) {
        targetCard.style.display = "block";
      }
    });
  });
}

// -------------------- 2. TOAST NOTIFICATION --------------------
function showToast(message = "Copied to clipboard!") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function copyToClipboard(elementId) {
  const elem = document.getElementById(elementId);
  if (!elem || !elem.value.trim()) {
    showToast("Nothing to copy!");
    return;
  }
  navigator.clipboard.writeText(elem.value)
    .then(() => showToast("Copied to clipboard! 📋"))
    .catch(() => {
      elem.select();
      document.execCommand("copy");
      showToast("Copied! 📋");
    });
}

// -------------------- 3. JSON FORMATTER & VALIDATOR --------------------
function initJsonStats() {
  const input = document.getElementById("json-input");
  const stats = document.getElementById("input-stats");
  input.addEventListener("input", () => {
    stats.textContent = `${input.value.length} chars | ${input.value.split("\n").length} lines`;
  });
}

function formatJson(spaces = 2) {
  const input = document.getElementById("json-input").value.trim();
  const output = document.getElementById("json-output");
  const errorBanner = document.getElementById("json-error-banner");
  const statusBadge = document.getElementById("json-status");
  const outputStats = document.getElementById("output-stats");

  if (!input) {
    output.value = "";
    errorBanner.style.display = "none";
    statusBadge.textContent = "Ready";
    statusBadge.className = "status-badge status-ready";
    return;
  }

  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, spaces);
    output.value = formatted;
    errorBanner.style.display = "none";
    statusBadge.textContent = "Valid JSON ✓";
    statusBadge.className = "status-badge status-ready";
    outputStats.textContent = `${formatted.length} chars | ${formatted.split("\n").length} lines`;
  } catch (err) {
    output.value = "";
    errorBanner.style.display = "block";
    errorBanner.textContent = `Syntax Error: ${err.message}`;
    statusBadge.textContent = "Invalid JSON ✕";
    statusBadge.className = "status-badge status-error";
  }
}

function minifyJson() {
  const input = document.getElementById("json-input").value.trim();
  const output = document.getElementById("json-output");
  const errorBanner = document.getElementById("json-error-banner");
  const statusBadge = document.getElementById("json-status");

  if (!input) return;

  try {
    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);
    output.value = minified;
    errorBanner.style.display = "none";
    statusBadge.textContent = "Minified ✓";
    statusBadge.className = "status-badge status-ready";
    document.getElementById("output-stats").textContent = `${minified.length} chars`;
  } catch (err) {
    errorBanner.style.display = "block";
    errorBanner.textContent = `Syntax Error: ${err.message}`;
    statusBadge.textContent = "Invalid JSON ✕";
    statusBadge.className = "status-badge status-error";
  }
}

function clearJson() {
  document.getElementById("json-input").value = "";
  document.getElementById("json-output").value = "";
  document.getElementById("json-error-banner").style.display = "none";
  const statusBadge = document.getElementById("json-status");
  statusBadge.textContent = "Ready";
  statusBadge.className = "status-badge status-ready";
  document.getElementById("input-stats").textContent = "0 chars";
  document.getElementById("output-stats").textContent = "0 chars";
}

function loadSampleJson() {
  const sample = {
    "project": "DevFormat Pro",
    "version": "1.0.0",
    "privacy": "100% Client-Side",
    "features": [
      "JSON Formatter & Validator",
      "JSON to CSV Converter",
      "JWT Token Debugger",
      "Base64 & URL Encoder",
      "RegEx Tester"
    ],
    "metrics": {
      "execution_time_ms": 0.4,
      "server_upload": false,
      "active_users": 150000
    }
  };
  document.getElementById("json-input").value = JSON.stringify(sample);
  formatJson(2);
}

// -------------------- 4. JSON ⇄ CSV CONVERTER --------------------
function convertJsonToCsv() {
  const input = document.getElementById("csv-json-input").value.trim();
  const output = document.getElementById("csv-output");

  if (!input) {
    showToast("Please provide JSON array input!");
    return;
  }

  try {
    let data = JSON.parse(input);
    if (!Array.isArray(data)) {
      if (typeof data === "object") data = [data];
      else throw new Error("JSON must be an array of objects.");
    }

    const headers = Array.from(new Set(data.flatMap(obj => Object.keys(obj))));
    const csvRows = [];
    csvRows.push(headers.join(","));

    for (const item of data) {
      const row = headers.map(header => {
        let val = item[header] !== undefined ? item[header] : "";
        if (typeof val === "object") val = JSON.stringify(val);
        val = String(val).replace(/"/g, '""');
        if (val.includes(",") || val.includes("\n") || val.includes('"')) {
          val = `"${val}"`;
        }
        return val;
      });
      csvRows.push(row.join(","));
    }

    output.value = csvRows.join("\n");
    showToast("Converted to CSV successfully! ✓");
  } catch (err) {
    alert("JSON to CSV Error: " + err.message);
  }
}

function convertCsvToJson() {
  const input = document.getElementById("csv-output").value.trim();
  const output = document.getElementById("csv-json-input");

  if (!input) {
    showToast("Please provide CSV input!");
    return;
  }

  try {
    const lines = input.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) throw new Error("CSV requires a header line and at least one data row.");

    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
    const jsonResult = [];

    for (let i = 1; i < lines.length; i++) {
      const currentline = lines[i].split(",");
      const obj = {};
      headers.forEach((header, index) => {
        let val = currentline[index] ? currentline[index].trim().replace(/^"|"$/g, "") : "";
        // Auto convert numbers and booleans
        if (!isNaN(val) && val !== "") val = Number(val);
        else if (val.toLowerCase() === "true") val = true;
        else if (val.toLowerCase() === "false") val = false;
        obj[header] = val;
      });
      jsonResult.push(obj);
    }

    output.value = JSON.stringify(jsonResult, null, 2);
    showToast("Converted to JSON successfully! ✓");
  } catch (err) {
    alert("CSV to JSON Error: " + err.message);
  }
}

function downloadCsvFile() {
  const csvContent = document.getElementById("csv-output").value;
  if (!csvContent.trim()) {
    showToast("No CSV data to download!");
    return;
  }
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "devformat_export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function clearCsvTool() {
  document.getElementById("csv-json-input").value = "";
  document.getElementById("csv-output").value = "";
}

function loadSampleCsvData() {
  const sample = [
    { "id": 101, "customer": "Stripe Inc", "plan": "Enterprise", "amount": 2999.00, "status": "Paid" },
    { "id": 102, "customer": "Shopify Ltd", "plan": "Pro", "amount": 899.50, "status": "Paid" },
    { "id": 103, "customer": "Netlify Cloud", "plan": "Starter", "amount": 149.00, "status": "Pending" },
    { "id": 104, "customer": "Vercel Systems", "plan": "Enterprise", "amount": 4500.00, "status": "Paid" }
  ];
  document.getElementById("csv-json-input").value = JSON.stringify(sample, null, 2);
  convertJsonToCsv();
}

// -------------------- 5. JWT INSPECTOR --------------------
function initJwtListeners() {
  const input = document.getElementById("jwt-input");
  input.addEventListener("input", parseJwt);
}

function parseJwt() {
  const token = document.getElementById("jwt-input").value.trim();
  const headerOut = document.getElementById("jwt-header-output");
  const payloadOut = document.getElementById("jwt-payload-output");
  const statusBadge = document.getElementById("jwt-status");

  if (!token) {
    headerOut.value = "";
    payloadOut.value = "";
    statusBadge.textContent = "Waiting for Token";
    statusBadge.className = "status-badge status-ready";
    return;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    statusBadge.textContent = "Invalid JWT Format";
    statusBadge.className = "status-badge status-error";
    headerOut.value = "Error: A valid JWT consists of three base64url-encoded parts separated by dots.";
    payloadOut.value = "";
    return;
  }

  try {
    const decodeB64 = (str) => {
      let output = str.replace(/-/g, "+").replace(/_/g, "/");
      while (output.length % 4) output += "=";
      return decodeURIComponent(
        atob(output)
          .split("")
          .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
    };

    const header = JSON.parse(decodeB64(parts[0]));
    const payload = JSON.parse(decodeB64(parts[1]));

    headerOut.value = JSON.stringify(header, null, 2);
    payloadOut.value = JSON.stringify(payload, null, 2);

    // Check expiration
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      const isExpired = Date.now() > expDate.getTime();
      statusBadge.textContent = isExpired ? `Expired (${expDate.toLocaleTimeString()})` : `Active (Valid)`;
      statusBadge.className = `status-badge ${isExpired ? "status-error" : "status-ready"}`;
    } else {
      statusBadge.textContent = "Valid JWT (No exp claim)";
      statusBadge.className = "status-badge status-ready";
    }
  } catch (e) {
    statusBadge.textContent = "Decode Failed";
    statusBadge.className = "status-badge status-error";
    headerOut.value = "Error decoding token: " + e.message;
  }
}

function loadSampleJwt() {
  const sample = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMzQ1Njc4OTAiLCJuYW1lIjoiQWxleCBWYW5kZXJiaWx0Iiwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhbGV4QGRldmZvcm1hdHByby5jb20iLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTc5ODc2MTYwMH0.Xv4t7YhV8a2N1M4P6O8Q0R2T4V6X8Z0B2D4F6H8J0L2";
  document.getElementById("jwt-input").value = sample;
  parseJwt();
}

function clearJwt() {
  document.getElementById("jwt-input").value = "";
  parseJwt();
}

// -------------------- 6. BASE64 & URL ENCODER/DECODER --------------------
function runBase64Encode() {
  const inp = document.getElementById("base64-input").value;
  try {
    const encoded = btoa(unescape(encodeURIComponent(inp)));
    document.getElementById("base64-output").value = encoded;
    showToast("Base64 Encoded! ✓");
  } catch (e) {
    alert("Encoding error: " + e.message);
  }
}

function runBase64Decode() {
  const inp = document.getElementById("base64-input").value.trim();
  try {
    const decoded = decodeURIComponent(escape(atob(inp)));
    document.getElementById("base64-output").value = decoded;
    showToast("Base64 Decoded! ✓");
  } catch (e) {
    alert("Invalid Base64 string!");
  }
}

function runUrlEncode() {
  const inp = document.getElementById("base64-input").value;
  document.getElementById("base64-output").value = encodeURIComponent(inp);
  showToast("URL Encoded! ✓");
}

function runUrlDecode() {
  const inp = document.getElementById("base64-input").value;
  try {
    document.getElementById("base64-output").value = decodeURIComponent(inp);
    showToast("URL Decoded! ✓");
  } catch (e) {
    alert("Invalid URL encoded string!");
  }
}

function clearBase64() {
  document.getElementById("base64-input").value = "";
  document.getElementById("base64-output").value = "";
}

// -------------------- 7. REGEX TESTER --------------------
function initRegexListeners() {
  const pat = document.getElementById("regex-pattern");
  const flags = document.getElementById("regex-flags");
  const txt = document.getElementById("regex-text");

  [pat, flags, txt].forEach(elem => {
    elem.addEventListener("input", runRegexTest);
  });
}

function runRegexTest() {
  const patternStr = document.getElementById("regex-pattern").value;
  const flagsStr = document.getElementById("regex-flags").value;
  const textStr = document.getElementById("regex-text").value;
  const highlightView = document.getElementById("regex-highlight-view");
  const matchCount = document.getElementById("regex-match-count");

  if (!patternStr || !textStr) {
    highlightView.textContent = textStr || "Matches will be highlighted in real time here...";
    matchCount.textContent = "0 matches";
    return;
  }

  try {
    const regex = new RegExp(patternStr, flagsStr.includes("g") ? flagsStr : flagsStr + "g");
    let matches = textStr.match(regex);
    const count = matches ? matches.length : 0;
    matchCount.textContent = `${count} match${count === 1 ? "" : "es"}`;

    // Highlight
    const escapedText = textStr
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const highlighted = escapedText.replace(regex, (match) => `<mark>${match}</mark>`);
    highlightView.innerHTML = highlighted;
  } catch (err) {
    matchCount.textContent = "Invalid RegEx";
    highlightView.innerHTML = `<span style="color: #ef4444;">RegEx Error: ${err.message}</span>`;
  }
}

function loadSampleRegex() {
  document.getElementById("regex-pattern").value = "[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+";
  document.getElementById("regex-flags").value = "gm";
  document.getElementById("regex-text").value = `Contact our engineering team:\nsupport@devformatpro.com\nsales-inquiry@enterprise.org\nfake-email@not-valid\nalex.smith+newsletter@techcorp.io`;
  runRegexTest();
}

function clearRegex() {
  document.getElementById("regex-pattern").value = "";
  document.getElementById("regex-text").value = "";
  runRegexTest();
}
