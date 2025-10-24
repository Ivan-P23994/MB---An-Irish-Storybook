(() => {
  if (typeof window === "undefined") {
    return;
  }

  const establishMailchimpGlobals = () => {
    if (typeof jQuery === "undefined") {
      return false;
    }

    (function ($) {
      window.fnames = window.fnames || [];
      window.ftypes = window.ftypes || [];
      window.fnames[0] = "EMAIL";
      window.ftypes[0] = "email";
      window.fnames[1] = "FNAME";
      window.ftypes[1] = "text";
      window.fnames[2] = "LNAME";
      window.ftypes[2] = "text";
      window.fnames[3] = "ADDRESS";
      window.ftypes[3] = "address";
      window.fnames[4] = "PHONE";
      window.ftypes[4] = "phone";
      window.fnames[5] = "BIRTHDAY";
      window.ftypes[5] = "birthday";
      window.fnames[6] = "COMPANY";
      window.ftypes[6] = "text";
    })(jQuery);

    window.$mcj = jQuery.noConflict(true);
    return true;
  };

  const getCountryUnicodeFlag = countryCode => {
    if (!countryCode || typeof countryCode !== "string") {
      return "";
    }
    return countryCode.toUpperCase().replace(/./g, char => {
      return String.fromCodePoint(char.charCodeAt(0) + 127397);
    });
  };

  const sanitizeHtml = str => {
    if (typeof str !== "string") {
      return "";
    }
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  };

  const sanitizeUrl = url => {
    if (typeof url !== "string") {
      return "";
    }
    const trimmedUrl = url.trim().toLowerCase();
    if (
      trimmedUrl.startsWith("javascript:") ||
      trimmedUrl.startsWith("data:") ||
      trimmedUrl.startsWith("vbscript:")
    ) {
      return "#";
    }
    return url;
  };

  const getBrowserLanguage = () => {
    const language = window?.navigator?.language;
    if (!language || typeof language !== "string") {
      return undefined;
    }
    const parts = language.split("-");
    if (parts.length < 2) {
      return language.toUpperCase();
    }
    return parts[1]?.toUpperCase();
  };

  const getDefaultCountryProgram = (defaultCountryCode, smsProgramData) => {
    if (!Array.isArray(smsProgramData) || smsProgramData.length === 0) {
      return null;
    }

    const browserLanguage = getBrowserLanguage();
    if (browserLanguage) {
      const foundProgram = smsProgramData.find(program => {
        return program?.countryCode === browserLanguage;
      });
      if (foundProgram) {
        return foundProgram;
      }
    }

    if (defaultCountryCode) {
      const foundProgram = smsProgramData.find(program => {
        return program?.countryCode === defaultCountryCode;
      });
      if (foundProgram) {
        return foundProgram;
      }
    }

    return smsProgramData[0];
  };

  const updateSmsLegalText = (countryCode, fieldName) => {
    if (!countryCode || !fieldName) {
      return;
    }

    const programs = window?.MC?.smsPhoneData?.programs;
    if (!Array.isArray(programs)) {
      return;
    }

    const program = programs.find(item => item?.countryCode === countryCode);
    if (!program || !program.requiredTemplate) {
      return;
    }

    const legalTextElement = document.querySelector(`#legal-text-${fieldName}`);
    if (!legalTextElement) {
      return;
    }

    const divRegex = new RegExp("</?[div][^>]*>", "gi");
    const fullAnchorRegex = new RegExp("<a.*?</a>", "g");
    const anchorRegex = new RegExp('<a href="(.*?)" target="(.*?)">(.*?)</a>');

    const requiredLegalText = program.requiredTemplate
      .replace(divRegex, "")
      .replace(fullAnchorRegex, "")
      .slice(0, -1);

    const anchorMatches = program.requiredTemplate.match(anchorRegex);

    if (anchorMatches && anchorMatches.length >= 4) {
      const linkElement = document.createElement("a");
      linkElement.href = sanitizeUrl(anchorMatches[1]);
      linkElement.target = sanitizeHtml(anchorMatches[2]);
      linkElement.textContent = sanitizeHtml(anchorMatches[3]);

      legalTextElement.textContent = `${requiredLegalText} `;
      legalTextElement.appendChild(linkElement);
      legalTextElement.appendChild(document.createTextNode("."));
    } else {
      legalTextElement.textContent = `${requiredLegalText}.`;
    }
  };

  const getCountryName = countryCode => {
    const countries = window.MC?.smsPhoneData?.smsProgramDataCountryNames;
    if (!Array.isArray(countries)) {
      return countryCode;
    }
    for (let i = 0; i < countries.length; i += 1) {
      if (countries[i]?.code === countryCode) {
        return countries[i].name;
      }
    }
    return countryCode;
  };

  const generateDropdownOptions = smsProgramData => {
    if (!Array.isArray(smsProgramData) || smsProgramData.length === 0) {
      return "";
    }

    return smsProgramData
      .map(program => {
        const flag = getCountryUnicodeFlag(program.countryCode);
        const countryName = getCountryName(program.countryCode);
        const callingCode = program.countryCallingCode || "";
        const sanitizedCountryCode = sanitizeHtml(program.countryCode || "");
        const sanitizedCountryName = sanitizeHtml(countryName || "");
        const sanitizedCallingCode = sanitizeHtml(callingCode || "");
        return `<option value="${sanitizedCountryCode}">${flag} ${sanitizedCountryName} ${sanitizedCallingCode}</option>`;
      })
      .join("");
  };

  const mockPlaceholders = [
    {
      countryCode: "US",
      placeholder: "+1 000 000 0000",
      helpText: "Include the US country code +1 before the phone number",
    },
    {
      countryCode: "GB",
      placeholder: "+44 0000 000000",
      helpText: "Include the GB country code +44 before the phone number",
    },
    {
      countryCode: "CA",
      placeholder: "+1 000 000 0000",
      helpText: "Include the CA country code +1 before the phone number",
    },
    {
      countryCode: "AU",
      placeholder: "+61 000 000 000",
      helpText: "Include the AU country code +61 before the phone number",
    },
    {
      countryCode: "DE",
      placeholder: "+49 000 0000000",
      helpText: "Fügen Sie vor der Telefonnummer die DE-Ländervorwahl +49 ein",
    },
    {
      countryCode: "FR",
      placeholder: "+33 0 00 00 00 00",
      helpText: "Incluez le code pays FR +33 avant le numéro de téléphone",
    },
    {
      countryCode: "ES",
      placeholder: "+34 000 000 000",
      helpText: "Incluya el código de país ES +34 antes del número de teléfono",
    },
    {
      countryCode: "NL",
      placeholder: "+31 0 00000000",
      helpText: "Voeg de NL-landcode +31 toe vóór het telefoonnummer",
    },
    {
      countryCode: "BE",
      placeholder: "+32 000 00 00 00",
      helpText: "Incluez le code pays BE +32 avant le numéro de téléphone",
    },
    {
      countryCode: "CH",
      placeholder: "+41 00 000 00 00",
      helpText: "Fügen Sie vor der Telefonnummer die CH-Ländervorwahl +41 ein",
    },
    {
      countryCode: "AT",
      placeholder: "+43 000 000 0000",
      helpText: "Fügen Sie vor der Telefonnummer die AT-Ländervorwahl +43 ein",
    },
    {
      countryCode: "IE",
      placeholder: "+353 00 000 0000",
      helpText: "Include the IE country code +353 before the phone number",
    },
    {
      countryCode: "IT",
      placeholder: "+39 000 000 0000",
      helpText:
        "Includere il prefisso internazionale IT +39 prima del numero di telefono",
    },
  ];

  const getDefaultPlaceholder = countryCode => {
    if (!countryCode || typeof countryCode !== "string") {
      return mockPlaceholders[0].placeholder;
    }
    const selected = mockPlaceholders.find(item => item?.countryCode === countryCode);
    return selected ? selected.placeholder : mockPlaceholders[0].placeholder;
  };

  const getDefaultHelpText = countryCode => {
    if (!countryCode || typeof countryCode !== "string") {
      return mockPlaceholders[0].helpText;
    }
    const selected = mockPlaceholders.find(item => item?.countryCode === countryCode);
    return selected ? selected.helpText : mockPlaceholders[0].helpText;
  };

  const setDefaultHelpText = countryCode => {
    const helpTextSpan = document.querySelector("#help-text");
    if (!helpTextSpan) {
      return;
    }
    helpTextSpan.textContent = getDefaultHelpText(countryCode);
  };

  const updatePlaceholder = (countryCode, fieldName) => {
    if (!countryCode || !fieldName) {
      return;
    }
    const phoneInput = document.querySelector(`#mce-${fieldName}`);
    if (!phoneInput) {
      return;
    }
    const placeholder = getDefaultPlaceholder(countryCode);
    if (placeholder) {
      phoneInput.placeholder = placeholder;
    }
  };

  const updateCountryCodeInstruction = (countryCode, fieldName) => {
    updatePlaceholder(countryCode, fieldName);
  };

  const updateHelpTextCountryCode = (countryCode, fieldName) => {
    if (!countryCode || !fieldName) {
      return;
    }
    setDefaultHelpText(countryCode);
  };

  const initializeSmsPhoneDropdown = fieldName => {
    if (!fieldName || typeof fieldName !== "string") {
      return;
    }

    const dropdown = document.querySelector(`#country-select-${fieldName}`);
    const displayFlag = document.querySelector(`#flag-display-${fieldName}`);
    if (!dropdown || !displayFlag) {
      return;
    }

    const smsPhoneData = window.MC?.smsPhoneData;
    if (smsPhoneData && Array.isArray(smsPhoneData.programs)) {
      dropdown.innerHTML = generateDropdownOptions(smsPhoneData.programs);
    }

    const defaultProgram = getDefaultCountryProgram(
      smsPhoneData?.defaultCountryCode,
      smsPhoneData?.programs,
    );
    if (defaultProgram && defaultProgram.countryCode) {
      dropdown.value = defaultProgram.countryCode;

      const flagSpan = displayFlag?.querySelector(`#flag-emoji-${fieldName}`);
      if (flagSpan) {
        flagSpan.textContent = getCountryUnicodeFlag(defaultProgram.countryCode);
        flagSpan.setAttribute(
          "aria-label",
          `${sanitizeHtml(defaultProgram.countryCode)} flag`,
        );
      }

      updateSmsLegalText(defaultProgram.countryCode, fieldName);
      updatePlaceholder(defaultProgram.countryCode, fieldName);
      updateCountryCodeInstruction(defaultProgram.countryCode, fieldName);
    }

    const phoneInput = document.querySelector(`#mce-${fieldName}`);
    if (phoneInput && defaultProgram?.countryCallingCode) {
      phoneInput.value = defaultProgram.countryCallingCode;
    }

    displayFlag?.addEventListener("click", () => {
      dropdown.focus();
    });

    dropdown?.addEventListener("change", function onCountryChange() {
      const selectedCountry = this.value;
      if (!selectedCountry || typeof selectedCountry !== "string") {
        return;
      }

      const flagSpan = displayFlag?.querySelector(`#flag-emoji-${fieldName}`);
      if (flagSpan) {
        flagSpan.textContent = getCountryUnicodeFlag(selectedCountry);
        flagSpan.setAttribute(
          "aria-label",
          `${sanitizeHtml(selectedCountry)} flag`,
        );
      }

      const selectedProgram = window.MC?.smsPhoneData?.programs.find(program => {
        return program && program.countryCode === selectedCountry;
      });
      const updatedPhoneInput = document.querySelector(`#mce-${fieldName}`);
      if (updatedPhoneInput && selectedProgram?.countryCallingCode) {
        updatedPhoneInput.value = selectedProgram.countryCallingCode;
      }

      updateSmsLegalText(selectedCountry, fieldName);
      updatePlaceholder(selectedCountry, fieldName);
      updateCountryCodeInstruction(selectedCountry, fieldName);
      updateHelpTextCountryCode(selectedCountry, fieldName);
    });
  };

  const initializeMailchimpForm = () => {
    const globalsEstablished = establishMailchimpGlobals();
    if (!globalsEstablished) {
      return;
    }

    if (!window.MC) {
      window.MC = {};
    }

    window.MC.smsPhoneData = {
      defaultCountryCode: "IE",
      programs: [],
      smsProgramDataCountryNames: [],
    };

    const smsPhoneFields = document.querySelectorAll('[id^="country-select-"]');
    smsPhoneFields.forEach(dropdown => {
      const fieldName = dropdown?.id.replace("country-select-", "");
      initializeSmsPhoneDropdown(fieldName);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMailchimpForm);
  } else {
    initializeMailchimpForm();
  }
})();
